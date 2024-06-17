import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserIdDto } from '../user/dto/user.dto';
import {
  GetLetterParams,
  GetLetterResDto,
  GetReceivedLetterResDto,
  GetSentLetterResDto,
  SendLetterDto,
  SendLetterResDto,
} from './dto/letter.dto';
import { LetterService } from './letter.service';
import { ExReq } from '../../common/middleware/auth.middleware';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('letter')
@Controller('/api/letter')
export class LetterController {
  constructor(private letterService: LetterService) {}

  @ApiOperation({ summary: '편지 상세보기' })
  @ApiResponse({ type: GetLetterResDto })
  @Get('/document/:letterDocumentId')
  getLetter(@Req() req: ExReq, @Param() params: GetLetterParams) {
    return this.letterService.getLetter(
      req.user.userId,
      params.letterDocumentId
    );
  }

  @ApiOperation({
    summary: '편지 보내기',
    description: 'pageTypes: ("text" | "picture") [] ',
  })
  @ApiResponse({ type: SendLetterResDto })
  @UseInterceptors(FilesInterceptor('files', 4))
  @Post('/:userId')
  sendLetter(
    @Req() req: ExReq,
    @Param() params: UserIdDto,
    @Body() body: SendLetterDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10_000_000 }), //10mb
          new FileTypeValidator({
            fileType:
              /(image\/jpg|image\/webp|image\/jpeg|image\/png|application\/pdf)/,
          }),
        ],
      })
    )
    files: Express.Multer.File[]
  ) {
    return this.letterService.sendLetter(
      req,
      params.userId,
      body.title,
      body.pageTypes,
      files
    );
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
