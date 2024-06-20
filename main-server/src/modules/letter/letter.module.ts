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
import { UploadModule } from '../upload/upload.module';
import { TranslateModule } from '../translate/translate.module';
import { KoreanAnalyzeModule } from '../korean-analyze/korean-analyze.module';
import { EpsonModule } from '../epson/epson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Letter]),
    MongooseModule.forFeature([
      {
        name: 'Letter',
        schema: LetterSchema,
      },
    ]),
    UserModule,
    UploadModule,
    TranslateModule,
    KoreanAnalyzeModule,
    EpsonModule,
  ],
  controllers: [LetterController],
  providers: [LetterService, LetterCrudService, LetterRepository],
  exports: [LetterRepository],
})
export class LetterModule {}
