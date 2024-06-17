import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStudyDto {
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @IsString({
    each: true,
  })
  @ArrayNotEmpty()
  keywords: string[];
}
