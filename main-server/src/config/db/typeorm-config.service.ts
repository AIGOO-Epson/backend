import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../env/env.service';

const entities = [];

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const typeormConfig: TypeOrmModuleOptions = {
      type: Environment.get('RDB_TYPE'),
      host: Environment.get('RDB_HOST'),
      port: Environment.get('RDB_PORT'),
      username: Environment.get('RDB_USERNAME'),
      password: Environment.get('RDB_PASSWORD'),
      database: Environment.get('RDB_PASSWORD'),
      // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      entities,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    };

    return typeormConfig;
  }
}
