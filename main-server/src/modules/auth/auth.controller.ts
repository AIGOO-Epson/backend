import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  AuthResDto,
  SignInDto,
  SignInResDto,
  SignUpDto,
  SignUpResDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExReq } from '../../common/middleware/auth.middleware';

@ApiTags('auth')
@Controller('/api/auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'jwt 쿠키 검증', description: 'need jwt cookie' })
  @ApiResponse({ type: AuthResDto })
  @Get()
  certificateJWT(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.certificateJWT(req, res);
  }

  @ApiOperation({
    summary: 'jwt 쿠키 검증 후 재발급',
    description: 'need jwt cookie',
  })
  @ApiResponse({ type: AuthResDto })
  @Post()
  regenJwt(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.regenJwt(req, res);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ type: SignInResDto })
  @Post('/signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res
    //네스트.com에서는 Response 타입 붙이라고 하는데? 붙이면 쿠키타입이 없다고 나옴. TS버전문제인가
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ type: SignUpResDto })
  @Post('/signup')
  async signUp(
    @Body()
    signUpDto: SignUpDto
  ) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ type: SignUpResDto })
  @Delete()
  async signOut(@Req() req: ExReq, @Res({ passthrough: true }) res) {
    return this.authService.signOut(req, res);
  }
}
