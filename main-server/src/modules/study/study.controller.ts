import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { StudyService } from './study.service';
import { ExReq } from '../../common/middleware/auth.middleware';
import {
  CreateStudyDto,
  GetStudyDataResDto,
  GetStudyDatasResDto,
  NewStudyForm,
} from './dto/study.dto';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { CrudController } from '@nestjs-library/crud';
import { StudyDataCrudService } from './crud.service';
import { StudyData } from './repository/study-data.entity';

export class GetStudyParams {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  studyId: number;
}

// @Crud({
//   entity: StudyData,
//   only: [GROUP.READ_MANY, GROUP.READ_ONE],
//   routes: {
//     readOne: {
//       exclude: ['owner', 'letterFrom'],
//     },
//   },
// })
@ApiTags('study')
@Controller('/api/study')
export class StudyController implements CrudController<StudyData> {
  constructor(
    private studyService: StudyService,
    public readonly crudService: StudyDataCrudService
  ) {}

  @ApiOperation({ summary: '내 학습자료 가져오기' })
  @ApiResponse({ type: GetStudyDatasResDto })
  @Get()
  readMany(@Req() req: ExReq) {
    return this.studyService.readMany(req.user.userId);
  }

  @ApiOperation({ summary: '학습자료 한개 가져오기' })
  @ApiResponse({ type: GetStudyDataResDto })
  @Get('/:studyId')
  readOne(@Req() req: ExReq, @Param() params: GetStudyParams) {
    return this.studyService.readOne(req.user.userId, params.studyId);
  }

  @ApiOperation({ summary: '학습자료 생성' })
  @ApiResponse({ type: NewStudyForm })
  @Post()
  createStudy(@Req() req: ExReq, @Body() body: CreateStudyDto) {
    return this.studyService.createStudy(req, body);
  }
}
