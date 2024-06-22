import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { swaggerConfig } from './config/swagger.config';
import { HttpLoggingInterceptor } from './common/middleware/http-logging.interceptor';
const logger = new Logger('NestJS Application');
const PORT = 4000;
//EXPOSE_PORT env served by docker-compose not .env
const EXPOSE_PORT = process.env.EXPOSE_PORT ?? 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 변환 활성화
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성 전송 시 예외 발생
    })
  );
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT);

  logger.log(`main-server listening on`);
  logger.log(`expose to local : ${EXPOSE_PORT} PORT`);
}
bootstrap();
