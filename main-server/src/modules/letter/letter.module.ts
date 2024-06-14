import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LetterSchema } from './repository/schema/letter-document.schema';
import { Letter } from './repository/letter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LetterRepository } from './repository/letter.repository';
import { UserModule } from '../user/user.module';
import { LetterCrudService } from './crud.service';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    NestjsFormDataModule,
    TypeOrmModule.forFeature([Letter]),
    MongooseModule.forFeature([
      {
        name: 'Letter',
        schema: LetterSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [LetterController],
  providers: [LetterService, LetterCrudService, LetterRepository],
})
export class LetterModule {}
