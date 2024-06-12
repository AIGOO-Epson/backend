import { Controller, Get, Req, Put, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExReq } from '../../../common/middleware/auth.middleware';
import { FollowService } from './follow.service';
import { UserIdDto } from '../dto/user.dto';
import { SimpleSuccessDto } from '../../../common/common.dto';
import { GetFollowResDto } from './dto/follow.dto';

@ApiTags('follow')
@Controller('/api/follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @ApiOperation({ summary: 'artist who i followed list' })
  @ApiResponse({ type: GetFollowResDto })
  @Get()
  getFollow(@Req() req: ExReq) {
    return this.followService.getFollow(req);
  }

  @ApiOperation({ summary: '팔로우' })
  @ApiResponse({ type: SimpleSuccessDto })
  @Put('/:userId')
  addFollow(@Req() req: ExReq, @Param() params: UserIdDto) {
    return this.followService.addFollow(req, params.userId);
  }

  @ApiOperation({ summary: '팔로우 취소' })
  @ApiResponse({ type: SimpleSuccessDto })
  @Delete('/:userId')
  removeFollow(@Req() req: ExReq, @Param() params: UserIdDto) {
    return this.followService.removeFollow(req, params.userId);
  }
}
