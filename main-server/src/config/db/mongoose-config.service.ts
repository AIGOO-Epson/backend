import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    // const host = this.configService.get<string>('MONGO_HOST', 'localhost');
    // const port = this.configService.get<number>('MONGO_PORT', 27017);
    // const dbName = this.configService.get<string>('MONGO_DB', 'test');
    // const user = this.configService.get<string>('MONGO_USER', '');
    // const pass = this.configService.get<string>('MONGO_PASS', '');

    // return {
    //   uri: `mongodb://${user}:${pass}@${host}:${port}/${dbName}`,
    // };

    // if (process.env.NODE_ENV === 'development') {
    // }

    const devMongoUri = 'mongodb://mgdb:27017/aigoo';
    return { uri: devMongoUri };
  }
}
