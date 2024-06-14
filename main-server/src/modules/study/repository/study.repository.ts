import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudyData } from './study-data.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudyRepository {
  constructor(
    @InjectRepository(StudyData)
    public readonly studyDataOrm: Repository<StudyData>
  ) {}
}
