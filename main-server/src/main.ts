import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/middleware/logging.interceptor';
import { Logger } from '@nestjs/common';
const logger = new Logger('NestJS Application');
const PORT = 3000;
const EXPOSE_PORT = process.env.EXPOSE_PORT ?? 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors();

  await app.listen(PORT);

  logger.log(`main-server listening on`);
  logger.log(`expose to local : ${EXPOSE_PORT} PORT`);
}
bootstrap();
