import { IMemoryDb, IBackup, newDb, DataType } from 'pg-mem';
import { DataSource, Repository, BaseEntity } from 'typeorm';
import { v4 } from 'uuid';

export const startPgMem = async (): Promise<PgMem> => {
  const pgMemInstance = new PgMem();
  await pgMemInstance.init();

  return pgMemInstance;
};

//https://github.com/oguimbal/pg-mem/blob/master/samples/typeorm/simple.ts
export class PgMem {
  private db: IMemoryDb;
  private dataSource: DataSource;
  private backup: IBackup;
  public repositorys: {
    [key: string]: { provide: string; useValue: Repository<BaseEntity> };
  } = {};
  //manually
  // public repositorys: {
  //   User: { provide: string; useValue: Repository<BaseEntity> };
  // };

  async init() {
    this.db = newDb();
    this.registerMockFunc();
    this.dataSource = await this.db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    });
    await this.dataSource.initialize();
    await this.dataSource.synchronize();

    this.initRepositorys();
  }

  /**엔티티 종류가 별로 없으면 수동으로 하는것도 타입가드 정확해서 좋을듯.*/
  initRepositorysManually() {
    // const userRepository: Repository<User> =
    //   this.dataSource.getRepository(User);

    // this.repositorys = {
    //   User: {
    //     provide: 'UserRepository',
    //     useValue: userRepository,
    //   },
    // };
    return;
  }
  /**auto load, mongoose와는 다르게 typeorm은 자동으로 엔티티를 긁어오니까 가능 */
  initRepositorys() {
    const entityMetadatas = this.dataSource.entityMetadatas;

    for (const metadata of entityMetadatas) {
      //둘다 작동.
      const entity = metadata.target;
      // const entity = metadata.tableMetadataArgs.target
      // console.log(User === entity)

      const entityName = metadata.targetName;
      const repository: Repository<BaseEntity> =
        this.dataSource.getRepository(entity);

      this.repositorys[entityName] = {
        //근데 이렇게 하면 리포지토리 서비스랑
        //이름 겹치지 않을까 했는데 그냥 잘됨.
        provide: `${entityName}Repository`,
        useValue: repository,
      };
    }
  }

  registerMockFunc() {
    this.db.public.registerFunction({
      implementation: () => 'test',
      name: 'current_database',
    });
    this.db.public.registerFunction({
      implementation: () => 'version',
      name: 'version',
    });

    this.db.registerExtension('uuid-ossp', (schema) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.uuid,
        implementation: v4,
        impure: true,
      });
    });

    // this.db.public.interceptQueries((sql) => {
    //   const newSql = sql.replace(/\bnumeric\s*\(\s*\d+\s*,\s*\d+\s*\)/g, 'float');
    //   if (sql !== newSql) {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    //     return db.public.many(newSql);
    //   }

    //   return null;
    // });
    this.db.public.interceptQueries((queryText) => {
      if (
        queryText.search(
          /(pg_views|pg_matviews|pg_tables|pg_enum|table_schema)/g
        ) > -1
      ) {
        return [];
      }
      return null;
    });

    return;
  }

  restore() {
    this.backup.restore();
    return;
  }

  makeBackup() {
    this.backup = this.db.backup();
    return;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  query(string: string) {
    return this.dataSource.query(string);
  }

  async destroy() {
    await this.dataSource.destroy();
    return;
  }
}
