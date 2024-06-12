import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LetterSchema } from './repository/schema/letter-document.schema';
import { Letter } from './repository/letter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LetterRepository } from './repository/letter.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Letter]),
    MongooseModule.forFeature([
      {
        name: 'Letter',
        schema: LetterSchema,
      },
    ]),
  ],
  controllers: [LetterController],
  providers: [LetterService, LetterRepository],
})
export class LetterModule {}
