import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TranslateService } from './translate.service';

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
  async getTestTranslate(): ReturnType<typeof TranslateService.prototype.run> {
    // const exampleText = [
    //   "Please, don't see.",
    //   'Just boy caught up in dreams and fantasie.',
    //   'please, see me.',
    //   'reaching out for someone I can see.',
    //   "Take my hand, let's see where we wake up tomorrow.",
    //   'Best laid plans sometimes are just a one night stand.',
    // ];
    // return this.translateService.translate(exampleText);

    const testPngUrl =
      'https://aigooback.blob.core.windows.net/test/demo-img.jpg';
    return await this.translateService.run(testPngUrl);
  }
}
