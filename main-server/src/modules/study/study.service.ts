import { Injectable } from '@nestjs/common';
import { StudyRepository } from './repository/study.repository';

@Injectable()
export class StudyService {
  constructor(private studyRepository: StudyRepository) {}
}
