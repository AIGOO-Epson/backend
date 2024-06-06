import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMongoUri } from './config/db/mongoose.config';
import { getTypeormConfig } from './config/db/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath, validateDevEnv } from './config/env/dev-env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(),
      isGlobal: true,
      validate: validateDevEnv,
    }),
    TypeOrmModule.forRoot(getTypeormConfig()),
    MongooseModule.forRoot(getMongoUri()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
