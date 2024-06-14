import { ApiProperty } from '@nestjs/swagger';
import { User } from '../repository/entity/user.entity';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetMyResDto extends User {
  @ApiProperty()
  myFavorite: number;
  @ApiProperty()
  epsonDevice: string;
  @ApiProperty()
  email: string;
}

export class UserIdDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  userId: number;
}
