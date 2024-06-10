import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../env/env.service';
import { User } from '../../modules/user/repository/user.entity';
import { Letter } from '../../modules/letter/repository/letter.entity';
import { Follow } from '../../modules/user/repository/follow.entity';
import { StudyData } from '../../modules/study/repository/study-data.entity';

export const entities = [User, Letter, Follow, StudyData];

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
