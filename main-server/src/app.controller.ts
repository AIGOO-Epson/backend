import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @ApiOperation({
    summary: 'server echo',
  })
  @Get('echo')
  @ApiResponse({ description: 'Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }
  
  @ApiOperation({
    summary: 'server echo with JWT auth check',
    description: 'echo + JWT 검증',
  })
  @Get('echo/auth')
  @ApiResponse({ description: 'Hello World!' })
  getHello2(): string {
    return this.appService.getHello();
  }
}
