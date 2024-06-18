import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export interface NewStudyForm {
  keywords: string[];
  title: string;
  url: string;
  owner: { id: number };
  letterFrom: { id: number };
}
