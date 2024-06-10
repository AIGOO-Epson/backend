import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';
//이걸로 쓴 데코레이터는 컨트롤러에서 validationPipe로 유효성체크할 수 있게 해준다.

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
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
  @ApiProperty()
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
