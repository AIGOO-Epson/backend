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
import {
  GetLetterParams,
  GetLetterResDto,
  GetReceivedLetterResDto,
  GetSentLetterResDto,
  ProcessScanResultParams,
  SendLetterByScanDto,
  SendLetterDto,
  SendLetterResDto,
} from './dto/letter.dto';
import { LetterService } from './letter.service';
import { ExReq } from '../../common/middleware/auth.middleware';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { SimpleSuccessDto } from '../../common/common.dto';
import { UserIdParam } from '../user/dto/user.dto';

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
    summary: '업로드로 편지 보내기(formData)',
    description: `
    formData: {
      files: 파일 여러개,
      title: string,
      pageTypes: ("text" | "picture") []
      }`,
  })
  @ApiResponse({ type: SendLetterResDto })
  @UseInterceptors(FilesInterceptor('files', 4))
  @Post('/:userId')
  sendLetterByUpload(
    @Req() req: ExReq,
    @Param() params: UserIdParam,
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
    return this.letterService.sendLetterByUpload(
      req,
      params.userId,
      body.title,
      body.pageTypes,
      files
    );
  }

  @ApiOperation({
    summary: '스캔으로 편지 보내기',
    description: 'if epsonDevice in jwt is null, err',
  })
  @ApiResponse({ type: SimpleSuccessDto })
  @Post('/by-scan/:userId')
  sendLetterByScan(
    @Req() req: ExReq,
    @Param() params: UserIdParam,
    @Body() body: SendLetterByScanDto
  ) {
    return this.letterService.sendLetterByScan(req, params.userId, body.title);
  }

  @ApiOperation({
    summary: '**프런트에서는 사용하지 않는 엔드포인트**',
  })
  @UseInterceptors(AnyFilesInterceptor())
  @Post('/scan/:uuid/:letterDocumentId')
  processScanResult(
    @Param() params: ProcessScanResultParams,
    @UploadedFiles()
    files: Express.Multer.File[]
  ) {
    console.log(files);
    console.log(params);
    return this.letterService.processScanReslt(params, files);
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

  @ApiOperation({
    summary: 'mock 편지 보내기(formData)',
    description: `
    formData: {
      files: 파일 여러개,
      title: string,
      pageTypes: ("text" | "picture") []
      }`,
  })
  @ApiResponse({ type: SendLetterResDto })
  @UseInterceptors(FilesInterceptor('files', 4))
  @Post('/mock/:userId')
  mockSendLetter(
    @Req() req: ExReq,
    @Param() params: UserIdParam,
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
    return this.letterService.mockSendLetter(
      req,
      params.userId,
      body.title,
      body.pageTypes,
      files
    );
  }
}
