import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
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
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@ApiTags('letter')
@Controller('/api/letter')
export class LetterController {
  constructor(private letterService: LetterService) {}

  @Post('/scan')
  // @UseInterceptors(FileInterceptor('file'))
  // @UseInterceptors(FilesInterceptor('files'))
  @UseInterceptors(AnyFilesInterceptor())
  async receiveFile(
    @Req() req,
    @Body() body,
    @UploadedFile() file,
    @UploadedFiles() files
  ) {
    console.log(req.headers);
    console.log('req.body', req.body);
    console.log('req.formData', req.formData);
    console.log('req.files', req.files);
    console.log('req.file', req.file);
    console.log('body', body);
    console.log('file', file);
    console.log('files', files);
  }

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

  @ApiOperation({ summary: 'get letter what i sent' })
  @ApiResponse({ type: GetSentLetterResDto })
  @Get('/sent')
  getSentLetter(@Req() req: ExReq) {
    return this.letterService.getSentLetters(req);
  }

  @ApiOperation({ summary: 'get letter wht i received' })
  @ApiResponse({ type: GetReceivedLetterResDto })
  @Get('/received')
  getReceivedLetter(@Req() req: ExReq) {
    return this.letterService.getReceivedLetters(req);
  }
}
