import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '../user/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const lowercaseUsername = signUpDto.username.toLocaleLowerCase();
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(signUpDto.password, salt);

    try {
      const newUser = await this.userRepository.createUser({
        username: lowercaseUsername,
        password: encryptedPassword,
        email: signUpDto.email,
      });
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('email or username already exist');
      }
      throw new InternalServerErrorException();
    }
  }
}
