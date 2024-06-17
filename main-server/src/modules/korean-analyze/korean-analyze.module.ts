import { Module } from '@nestjs/common';
import { KoreanAnalyzeService } from './korean-analyze.service';

@Module({
  providers: [KoreanAnalyzeService],
  exports: [KoreanAnalyzeService],
})
export class KoreanAnalyzeModule {}
