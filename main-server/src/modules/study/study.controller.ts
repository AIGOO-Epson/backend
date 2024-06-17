import { Body, Controller, Post, Req } from '@nestjs/common';
import { StudyService } from './study.service';
import { ExReq } from '../../common/middleware/auth.middleware';
import { CreateStudyDto } from './dto/study.dto';

@Controller('/api/study')
export class StudyController {
  constructor(private studyService: StudyService) {}

  @Post()
  createStudy(@Req() req: ExReq, @Body() body: CreateStudyDto) {
    console.log(body);
  }
}
