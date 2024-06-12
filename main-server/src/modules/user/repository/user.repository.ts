import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { ArtistInfo } from './entity/artist-info.entity';

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    public readonly userOrm: Repository<User>,
    @InjectRepository(ArtistInfo)
    public readonly artistInfoOrm: Repository<ArtistInfo>
  ) {}

  createUser(signUpDto: CreateUserDto) {
    const { email, username, password } = signUpDto;
    const newUser = new User();
    newUser.email = email;
    newUser.username = username;
    newUser.password = password;

    return this.userOrm.save(newUser);
  }
}
