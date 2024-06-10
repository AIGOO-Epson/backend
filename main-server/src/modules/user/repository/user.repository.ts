import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from '../../auth/dto/auth.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userOrm: Repository<User>
  ) {}

  createUser(signUpDto: SignUpDto) {
    return this.userOrm.save(signUpDto);
  }

  async checkUserExist(
    email: string,
    username: string
  ): Promise<{ isUserExist: boolean }> {
    const existTestResult = await Promise.all([
      this.userOrm.findOneBy({
        username,
      }),
      this.userOrm.findOneBy({ email }),
    ]);

    //some 메서드는 true를 찾으면 중지하고 true 반환
    if (existTestResult.some((i) => i !== null)) {
      return { isUserExist: true };
    }
    return { isUserExist: false };
  }
}
