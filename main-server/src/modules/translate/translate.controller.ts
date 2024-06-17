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
  async getTestTranslate(): ReturnType<
    typeof TranslateService.prototype.getPrincipalParts
  > {
    return await this.translateService.getPrincipalParts([
      '오른',
      '갈았다',
      '나간',
      '달린',
    ]);
  }
}
