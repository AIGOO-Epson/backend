import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TranslateService } from './translate.service';
import axios from 'axios';

@Controller('/translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}
  @ApiOperation({
    summary: '영어 또는 한국어간 번역',
    description:
      '영어 또는 한국어간 번역을 수행합니다. 번역 텍스트의 언어는 자동으로 감지합니다.',
  })
  @Get('test')
  @ApiResponse({ description: '번역된 텍스트' })
  async getTestTranslate() {
    const testPngUrl =
      'https://aigooback.blob.core.windows.net/2bae8548-7ddb-4d14-afb7-9e919904c7dd/66753b558dc77772dd9f7d67.pdf';

    const response = await axios.get(testPngUrl, {
      responseType: 'arraybuffer',
    });

    return (await this.translateService.genLearningSet(['당근', '달리다'])).get(
      '달리다'
    );
  }
}
