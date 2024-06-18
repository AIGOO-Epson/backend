import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';
import {
  User,
  UserRole,
  UserRoleEnum,
} from '../../user/repository/entity/user.entity';
import { JwtPayload } from '../auth.service';

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

export class SignUpResDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  constructor(id: number, email: string, username: string) {
    this.userId = id;
    this.email = email;
    this.username = username;
  }

  static fromUser(user: User): SignUpResDto {
    return new SignUpResDto(user.id, user.email, user.username);
  }
}

export class SignInResDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  accessToken: string;

  // @ApiProperty()
  // uuid: string;

  @ApiProperty()
  success: true;

  constructor({
    userId,
    accessToken,
    success,
    username,
    // uuid,
  }: {
    userId: number;
    accessToken: string;
    success: true;
    username: string;
    // uuid: string;
  }) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.success = success;
    this.username = username;
    // this.uuid = uuid;
  }
}

export class AuthResDto implements JwtPayload {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: ['string', 'null'] })
  epsonDevice: string | null;

  @ApiProperty({ enum: UserRoleEnum })
  role: UserRole;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  iat?: number;
  @ApiProperty()
  exp?: number;
}
