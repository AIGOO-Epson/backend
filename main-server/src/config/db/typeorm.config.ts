import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../../modules/user/repository/user.entity';

export const devTypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'pgdb',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  entities: [User],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

export const getTypeormConfig = () => {
  // if (process.env.NODE_ENV === 'development') {
  // }
  return devTypeORMConfig;
};
