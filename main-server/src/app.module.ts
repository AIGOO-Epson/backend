import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath, validateDevEnv } from './config/env/dev-env.validation';
import { TypeOrmConfigService } from './config/db/typeorm-config.service';
import { MongooseConfigService } from './config/db/mongoose-config.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(),
      isGlobal: true,
      validate: validateDevEnv,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
