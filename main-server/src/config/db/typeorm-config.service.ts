import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DevEnvironment } from '../env/dev-env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const entities = [];

/**docker env */
export const devTypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'pgdb',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  entities,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

/**local env */
export const localTypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localshost',
  port: 5433,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  entities,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // if (process.env.NODE_ENV === 'development') {
    // }

    const devTypeORMConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'pgdb',
      port: 5432,
      username: DevEnvironment.get('USERNAME'),
      password: 'postgres',
      database: 'postgres',
      // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      entities,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    };

    const localTypeORMConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localshost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      entities,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    };

    return devTypeORMConfig;
  }
}
