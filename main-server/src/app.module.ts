import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath, validateDevEnv } from './config/env/env.validation';
import { TypeOrmConfigService } from './config/db/typeorm-config.service';
import { MongooseConfigService } from './config/db/mongoose-config.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { UserController } from './modules/user/user.controller';
import { UploadModule } from './modules/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LetterModule } from './modules/letter/letter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(),
      isGlobal: true,
      validate: validateDevEnv,
    }),
    ServeStaticModule.forRoot({
      //'localhost:port/files/~추가경로~' 로 파일서빙
      rootPath: join(__dirname, '..', 'src', 'files'),
      serveRoot: '/files',
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    UserModule,
    AuthModule,
    UploadModule,
    LetterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //https://docs.nestjs.com/middleware 미들웨어 컨슈머 전역으로 설치하는법
    //지금 user컨트롤러에는 제외해놨음
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)')
      .exclude('echo')
      .forRoutes(AppController, UserController);
  }
}
