import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '@nestjs-library/crud';
import { Repository } from 'typeorm';
import { User } from './repository/user.entity';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository);
  }
}
