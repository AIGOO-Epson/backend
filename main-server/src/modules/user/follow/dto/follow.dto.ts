import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../repository/entity/user.entity';
class FollowListMember {
  @ApiProperty()
  followedAt: Date;

  @ApiProperty()
  artist: User;
}

export class GetFollowResDto {
  @ApiProperty({ type: [FollowListMember] })
  followList: FollowListMember[];
}
