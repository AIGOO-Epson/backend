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
  // @UseInterceptors(FilesInterceptor('files'))
  // async receiveFile(@UploadedFiles() files, @Req() req) {
  async receiveFile(@Req() req: Request) {
    console.log(req.headers);
    console.log(req.body);
    // try {
    //   if (!files) {
    //     console.log('missing file');
    //   }
    //   const fileBuffer = files[0].buffer;
    //   // Process the buffer as needed
    //   console.log('--------------file buffer is------------');
    //   console.log(fileBuffer);
    //   console.log(files[0]);
    // } catch (error) {
    //   console.log('err');
    //   console.log(error);
    // }
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
