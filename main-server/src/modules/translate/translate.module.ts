import { Module } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TranslateController } from './translate.controller';

@Module({
  providers: [TranslateService],
  controllers: [TranslateController],
})
export class TranslateModule {}
