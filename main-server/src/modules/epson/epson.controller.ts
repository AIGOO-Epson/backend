import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExReq } from '../../common/middleware/auth.middleware';
import { IsString } from 'class-validator';
import { EpsonService } from './epson.service';
import { SimpleSuccessDto } from '../../common/common.dto';

class PrintRequestDto {
  @ApiProperty()
  @IsString()
  targetUrl: string;
}

@ApiTags('epson')
@Controller('/api/epson')
export class EpsonController {
  constructor(private epsonService: EpsonService) {}

  @ApiOperation({
    summary: '프린트 요청',
    description: 'if epsonDevice in jwt is null, err',
  })
  @ApiResponse({ type: SimpleSuccessDto })
  @Post('/print')
  printRequest(@Req() req: ExReq, @Body() body: PrintRequestDto) {
    return this.epsonService.printRequest(req, body.targetUrl);
  }
}
