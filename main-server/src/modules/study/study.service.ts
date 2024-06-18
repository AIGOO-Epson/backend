import { Injectable } from '@nestjs/common';
import { StudyRepository } from './repository/study.repository';
import { TranslateService } from '../translate/translate.service';

@Injectable()
export class StudyService {
  constructor(
    private studyRepository: StudyRepository,
    private translateService: TranslateService
  ) {
    // this.tst();
  }

  async tst() {
    const t = await this.translateService.genLearningSet(['안녕']);
    console.log(t);
  }
}
