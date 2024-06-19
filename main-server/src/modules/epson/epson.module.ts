import { Module } from '@nestjs/common';
import { EpsonService } from './epson.service';
import { EpsonController } from './epson.controller';

@Module({
  controllers: [EpsonController],
  providers: [EpsonService],
  exports: [EpsonService],
})
export class EpsonModule {}
