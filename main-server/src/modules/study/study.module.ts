import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { StudyRepository } from './repository/study.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyData } from './repository/study-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyData])],
  controllers: [StudyController],
  providers: [StudyService, StudyRepository],
})
export class StudyModule {}
