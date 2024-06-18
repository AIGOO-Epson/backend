import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StudyData } from '../repository/study-data.entity';

export class CreateStudyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @ApiProperty()
  @IsString({
    each: true,
  })
  @ArrayNotEmpty()
  keywords: string[];

  @ApiProperty()
  @IsString()
  title: string;
}

export class GetStudyDatasResDto {
  @ApiProperty({ type: [StudyData] })
  studyDatas: StudyData[];
}

export class GetStudyDataResDto {
  @ApiProperty({ type: StudyData })
  studyData: StudyData;
}

class OwnerId {
  @ApiProperty()
  id: number;
}
class LetterFromId {
  @ApiProperty()
  id: number;
}

export class NewStudyForm {
  @ApiProperty()
  keywords: string[];
  @ApiProperty()
  title: string;
  @ApiProperty()
  url: string;
  @ApiProperty({ type: OwnerId })
  owner: { id: number };
  @ApiProperty({ type: LetterFromId })
  letterFrom: { id: number };
}
