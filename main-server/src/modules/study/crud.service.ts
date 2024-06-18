import { CrudService } from '@nestjs-library/crud';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyData } from './repository/study-data.entity';

@Injectable()
export class StudyDataCrudService extends CrudService<StudyData> {
  constructor(@InjectRepository(StudyData) repository: Repository<StudyData>) {
    super(repository);
  }
}
