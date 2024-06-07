import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { HttpLoggingInterceptor } from './common/middleware/http-logging.interceptor';
const logger = new Logger('NestJS Application');
const PORT = 3000;
//EXPOSE_PORT env served by docker-compose not .env
const EXPOSE_PORT = process.env.EXPOSE_PORT ?? 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT);

  logger.log(`main-server listening on`);
  logger.log(`expose to local : ${EXPOSE_PORT} PORT`);
}
bootstrap();
