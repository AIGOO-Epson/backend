import { ApiProperty } from '@nestjs/swagger';
import { User } from '../repository/entity/user.entity';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { SimpleSuccessDto } from '../../../common/common.dto';

export class GetMyResDto extends User {
  @ApiProperty()
  myFavorite: number;
  @ApiProperty()
  epsonDevice: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  uuid: string;
}

export class UserIdParam {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  userId: number;
}

export class UpsertEpsonDeviceParams {
  @ApiProperty({ description: 'email form' })
  @IsNotEmpty()
  @IsEmail()
  device: string;
}

export class UpdateUserImgResDto extends SimpleSuccessDto {
  @ApiProperty()
  url: string;
}
