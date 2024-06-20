import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExReq } from '../../../common/middleware/auth.middleware';
import { User } from '../repository/entity/user.entity';
import { ArtistService } from './artist.service';
import { ArtistInfo } from '../repository/entity/artist-info.entity';
import { UserIdParam } from '../dto/user.dto';

@ApiTags('artist')
@Controller('/api/artist')
export class ArtistController {
  constructor(private artistService: ArtistService) {}

  @ApiOperation({ summary: '아티스트 정보' })
  @ApiResponse({ type: ArtistInfo })
  @Get('/:userId')
  getArtist(@Param() params: UserIdParam) {
    return this.artistService.getArtist(params.userId);
  }

  @ApiOperation({ summary: '일반유저 아티스트로 승격' })
  @ApiResponse({ type: User })
  @Patch('/role/:userId')
  upgradeToArtist(@Req() req: ExReq, @Param() params: UserIdParam) {
    return this.artistService.upgradeToArtist(req, params.userId);
  }
}
