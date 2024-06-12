import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../user/repository/user.repository';
import { PgMem, startPgMem } from '../../config/db/pg-mem';
import { SignUpDto } from '../auth/dto/auth.dto';
import { UserService } from './user.service';
import { DataSource } from 'typeorm';

const testUserList: SignUpDto[] = Array.from({ length: 10 }, (_, index) => {
  return {
    email: 'test' + index + '@gmail.com',
    username: 'test' + index,
    password: 'test',
  };
});

const insertUser = (id, { email, username, password }) => {
  return `
  INSERT INTO user (
  id, email, username, pasword)
  VALUES (${id}, '${email}', '${username}', '${password}'
  );
  `;
};

describe('UserService', () => {
  let pgMemInstance: PgMem;
  let userSerivce: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    pgMemInstance = await startPgMem();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        pgMemInstance.repositorys['User'],
        pgMemInstance.repositorys['AartistInfo'],
      ],
    }).compile();

    userSerivce = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);

    for (const [index, testUser] of testUserList.entries()) {
      await pgMemInstance.query(insertUser(index, testUser));
    }
    const t = await userRepository.userOrm.find();
    console.log(t);
    pgMemInstance.makeBackup();
  });

  afterEach(async () => {
    pgMemInstance.restore();
  });

  it('should signup, throw conflict exception', async () => {
    const t = await userRepository.userOrm.find();
    console.log(t);
  });
});
