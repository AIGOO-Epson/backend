import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './repository/entity/user.entity';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { ExReq } from '../../common/middleware/auth.middleware';
import { GetMyResDto, UserIdDto } from './dto/user.dto';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '내정보, 자세한 정보 접근' })
  @ApiResponse({ type: GetMyResDto })
  @Get()
  getMy(@Req() req: ExReq) {
    return this.userService.getMy(req);
  }

  @ApiOperation({ summary: '다른 유저 정보' })
  @ApiResponse({ type: User })
  @Get('/:userId')
  getUser(@Param() params: UserIdDto) {
    return this.userService.getUser(params.userId);
  }

  @ApiOperation({ summary: '아티스트 정보' })
  @ApiResponse({ type: ArtistInfo })
  @Get('/artist/:userId')
  getArtist(@Param() params: UserIdDto) {
    return this.userService.getArtist(params.userId);
  }

  @ApiOperation({ summary: '일반유저 아티스트로 승격' })
  @ApiResponse({ type: User })
  @Patch('/role/artist/:userId')
  upgradeToArtist(@Req() req: ExReq, @Param() params: UserIdDto) {
    return this.userService.upgradeToArtist(req, params.userId);
  }
}
