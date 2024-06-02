import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TstDto {
  @ApiProperty({ description: 'tst' })
  @IsNotEmpty()
  @IsString()
  tst: string;
}

class TstParams {
  @ApiProperty({ description: 'tst' })
  @IsNumberString()
  numberstring: string;

  @ApiProperty({ description: 'tst' })
  @IsString()
  string: string;
}

export class SignInDto {
  @ApiProperty({ description: 'tst' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'tst' })
  @IsNotEmpty()
  @MinLength(4, {
    message: '비밀번호가 4글자 이상 필요해요.',
  })
  @MaxLength(20, {
    message: '비밀번호가 20글자를 초과했어요.',
  })
  @Matches(/^\S*$/)
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsNotEmpty()
  @MinLength(3, {
    message: 'username이 3글자 이상 필요해요.',
  })
  @MaxLength(10, {
    message: 'username이 10글자를 초과했어요.',
  })
  @Matches(/^[\da-z]+$/, {
    message: 'username에는 영어 소문자와 숫자만 가능해요.',
  })
  username: string;
}

class TstQuery extends SignInDto {}

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //how to use validation, simple explain
  //global validation enabled at main.ts,
  //dont need to write @Body(ValidationPipe), just @Body()
  //tst url example,
  //localhost:4000/app/tst/sss/1123?email=hoontou@gmail.com&password=444 <- password length err
  //err msg = query password need atleast 4 word

  //localhost:4000/app/tst/sss/11qq23?email=hoontou@gmail.com&password=44444
  //                          /:numberstring , numberstring value is '1344' like.
  //                                           '11qq23' is just string, not numberstring
  //err msg = numberstring must be number string
  @Post('/tst/:string/:numberstring')
  tst(
    @Body() body: TstDto,
    @Param() tstParams: TstParams,
    @Query() tstQuery: TstQuery
  ): TstDto {
    console.log(tstQuery);
    console.log(tstParams);
    console.log(body);
    return body;
  }
}
