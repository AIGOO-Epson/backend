import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserIdDto } from '../user/dto/user.dto';
import {
  GetReceivedLetterResDto,
  GetSentLetterResDto,
  SendLetterDto,
} from './dto/letter.dto';
import { LetterService } from './letter.service';
import { ExReq } from '../../common/middleware/auth.middleware';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SimpleSuccessDto } from '../../common/common.dto';

@ApiTags('letter')
@Controller('/api/letter')
export class LetterController {
  constructor(private letterService: LetterService) {}

  @ApiOperation({ summary: 'send letter' })
  @ApiResponse({ type: SimpleSuccessDto })
  @Post('/:userId')
  sendLetter(
    @Req() req: ExReq,
    @Param() params: UserIdDto,
    @Body() body: SendLetterDto
  ) {
    return this.letterService.sendLetter(req, params.userId, body.title);
  }

  @ApiOperation({ summary: '보낸 편지들' })
  @ApiResponse({ type: GetSentLetterResDto })
  @Get('/sent')
  getSentLetter(@Req() req: ExReq) {
    return this.letterService.getSentLetters(req);
  }

  @ApiOperation({ summary: '받은 편지들' })
  @ApiResponse({ type: GetReceivedLetterResDto })
  @Get('/received')
  getReceivedLetter(@Req() req: ExReq) {
    return this.letterService.getReceivedLetters(req);
  }
}
