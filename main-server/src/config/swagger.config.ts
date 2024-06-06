import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Aigoo')
  .setDescription('Aigoo backend API description')
  .setVersion('1.0')
  .build();
