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
import { FollowController } from './modules/user/follow/follow.controller';
import { TranslateModule } from './modules/translate/translate.module';
import { TranslateController } from './modules/translate/translate.controller';
import { LetterController } from './modules/letter/letter.controller';
import { StudyModule } from './modules/study/study.module';
import { StudyController } from './modules/study/study.controller';
import { EpsonModule } from './modules/epson/epson.module';
import { KoreanAnalyzeModule } from './modules/korean-analyze/korean-analyze.module';
import { EpsonController } from './modules/epson/epson.controller';

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
    TranslateModule,
    StudyModule,
    EpsonModule,
    KoreanAnalyzeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('echo')
      .exclude('translate/test')
      .exclude('api/letter/scan/:uuid/:letterDocumentId')
      .forRoutes(
        UserController,
        FollowController,
        TranslateController,
        LetterController,
        StudyController,
        EpsonController
      );
  }
}
