import { ApiProperty } from '@nestjs/swagger';
import { User } from '../repository/entity/user.entity';

export class GetMyResDto extends User {
  @ApiProperty()
  myFavorite: number;
  @ApiProperty()
  epsonDevice: string;
  @ApiProperty()
  email: string;
}
