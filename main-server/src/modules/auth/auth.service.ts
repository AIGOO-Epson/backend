import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UserRepository,
} from '../user/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import {
  SignInDto,
  SignInResDto,
  SignUpDto,
  SignUpResDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { Crypto } from '../../common/crypter';
import { User } from '../user/repository/entity/user.entity';

export interface JwtPayload {
  username: string;
  userId: string;
  uuid: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private expirationDate = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}
  async certificateJWT(@Req() req, @Res() res) {
    const accessToken: string | undefined = req.cookies['Authorization'];

    if (!accessToken) {
      throw new UnauthorizedException('accessToken missing');
    }

    try {
      const jwtPayload: JwtPayload = await this.jwtService.verify(accessToken);
      return jwtPayload;
    } catch {
      res.clearCookie('Authorization');

      throw new UnauthorizedException('unauthorized, auth failed');
    }
  }

  async signIn(signInDto: SignInDto, @Res() res) {
    const { email, password } = signInDto;

    const user: User | null = await this.userRepository.userOrm.findOne({
      where: { email },
    });

    if (user === null || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('user not found or incorrect password');
    }

    const jwtPayload: JwtPayload = {
      username: user.username,
      userId: Crypto.encrypt(user.id),
      uuid: user.uuid,
    }; //payload에 적재할 정보 명시
    const accessToken = await this.jwtService.sign(jwtPayload);

    res.cookie('Authorization', accessToken, {
      httpOnly: false,
      maxAge: this.expirationDate,
    });

    return new SignInResDto({
      success: true,
      accessToken,
      ...jwtPayload,
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpResDto> {
    try {
      const lowercaseUsername = signUpDto.username.toLocaleLowerCase();
      const salt = await bcrypt.genSalt();
      const encryptedPassword = await bcrypt.hash(signUpDto.password, salt);

      const createUserForm: CreateUserDto = {
        username: lowercaseUsername,
        password: encryptedPassword,
        email: signUpDto.email,
      };
      const newUser = await this.userRepository.createUser(createUserForm);

      return SignUpResDto.fromUser(newUser, Crypto.encrypt(newUser.id));
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('email or username already exist');
      }
      throw new InternalServerErrorException();
    }
  }
}
