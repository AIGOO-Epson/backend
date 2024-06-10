import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from '../../auth/dto/auth.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    public readonly userOrm: Repository<User>
  ) {}

  createUser(signUpDto: SignUpDto) {
    const { email, username, password } = signUpDto;
    const newUser = new User();
    newUser.email = email;
    newUser.username = username;
    newUser.password = password;

    return this.userOrm.save(newUser);
  }
}
