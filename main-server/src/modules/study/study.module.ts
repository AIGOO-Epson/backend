import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { StudyRepository } from './repository/study.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyData } from './repository/study-data.entity';
import { TranslateModule } from '../translate/translate.module';
import { UploadModule } from '../upload/upload.module';
import { StudyDataCrudService } from './crud.service';
import { PdfService } from './pdf.service';
import { LetterModule } from '../letter/letter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyData]),
    TranslateModule,
    UploadModule,
    LetterModule,
  ],
  controllers: [StudyController],
  providers: [StudyService, StudyDataCrudService, StudyRepository, PdfService],
})
export class StudyModule {}
