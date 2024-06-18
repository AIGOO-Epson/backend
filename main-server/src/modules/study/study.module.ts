import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { StudyRepository } from './repository/study.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyData } from './repository/study-data.entity';
import { TranslateModule } from '../translate/translate.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudyData]), TranslateModule],
  controllers: [StudyController],
  providers: [StudyService, StudyRepository],
})
export class StudyModule {}
