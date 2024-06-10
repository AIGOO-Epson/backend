import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  // @Get('/auth') //필요한 파라미터는 없고, signin으로부터 클라이언트가 받은 쿠키안에 토큰 필요
  // async auth(@Req() req: Request, @Res({ passthrough: true }) res) {
  //   return this.authService.auth(req, res);
  // }

  // @Post('/signin')
  // async signIn(
  //   @Body() signInDto: SignInDto,
  //   @Res({ passthrough: true }) res
  //   //네스트.com에서는 Response 타입 붙이라고 하는데? 붙이면 쿠키타입이 없다고 나옴. TS버전문제인가
  // ) {
  //   return this.authService.signIn(signInDto, res);
  // }

  @Post('/signup')
  async signUp(
    @Body()
    signUpDto: SignUpDto
  ) {
    return this.authService.signUp(signUpDto);
  }
}
