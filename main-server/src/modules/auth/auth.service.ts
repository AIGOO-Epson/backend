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
import { User, UserRole } from '../user/repository/entity/user.entity';
import { ExReq } from '../../common/middleware/auth.middleware';

export interface JwtPayload {
  username: string;
  userId: number;
  epsonDevice: string | null;
  role: UserRole;
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

  async regenJwt(@Req() req: ExReq, @Res() res) {
    const oldPayload = await this.certificateJWT(req, res);

    const user: User | null = await this.userRepository.userOrm.findOne({
      where: { id: oldPayload.userId },
    });

    if (user === null) {
      throw new UnauthorizedException('user not found');
    }

    const newJwtPayload: JwtPayload = {
      username: user.username,
      userId: user.id,
      role: user.role,
      uuid: user.uuid,
      epsonDevice: user.epsonDevice,
    }; //payload에 적재할 정보 명시
    const newAccessToken = await this.jwtService.sign(newJwtPayload);

    res.cookie('Authorization', newAccessToken, {
      domain: 'https://aigoo.online',
      httpOnly: false,
      maxAge: this.expirationDate,
      sameSite: 'None',
      secure: true,
    });

    return newJwtPayload;
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
      userId: user.id,
      role: user.role,
      uuid: user.uuid,
      epsonDevice: user.epsonDevice,
    }; //payload에 적재할 정보 명시
    const accessToken = await this.jwtService.sign(jwtPayload);

    res.cookie('Authorization', accessToken, {
      domain: 'https://aigoo.online',
      httpOnly: false,
      maxAge: this.expirationDate,
      sameSite: 'None',
      secure: true,
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

      return SignUpResDto.fromUser(newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('email or username already exist');
      }
      throw new InternalServerErrorException();
    }
  }
}
