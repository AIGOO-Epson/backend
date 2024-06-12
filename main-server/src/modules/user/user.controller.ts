import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './repository/entity/user.entity';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { ExReq } from '../../common/middleware/auth.middleware';
import { GetMyResDto } from './dto/user.dto';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiResponse({ type: GetMyResDto })
  @Get()
  getMy(@Req() req: ExReq) {
    return this.userService.getMy(req);
  }

  @ApiResponse({ type: User })
  @Get('/:userId')
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(Number(userId));
  }

  @ApiResponse({ type: ArtistInfo })
  @Get('/artist/:userId')
  getArtist(@Param('userId') userId: string) {
    return this.userService.getArtist(Number(userId));
  }

  @Patch('/role/artist/:userId')
  upgradeToArtist(@Param('userId') userId: string) {
    return this.userService.upgradeToArtist(Number(userId));
  }
}
