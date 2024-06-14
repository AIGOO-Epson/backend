import { Module } from '@nestjs/common';
import { EpsonService } from './epson.service';

@Module({
  providers: [EpsonService],
})
export class EpsonModule {}
