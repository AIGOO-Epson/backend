import { ApiProperty } from '@nestjs/swagger';

export class SimpleSuccessDto {
  @ApiProperty()
  success: true;
}
