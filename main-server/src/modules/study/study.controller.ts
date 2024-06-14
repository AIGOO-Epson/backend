import { Controller } from '@nestjs/common';
import { StudyService } from './study.service';

@Controller('/api/study')
export class StudyController {
  constructor(private studyService: StudyService) {}
}
