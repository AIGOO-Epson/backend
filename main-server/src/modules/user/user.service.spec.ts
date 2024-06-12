import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../user/repository/user.repository';
import { PgMem, startPgMem } from '../../config/db/pg-mem';
import { SignUpDto } from '../auth/dto/auth.dto';
import { UserService } from './user.service';
import { User } from './repository/entity/user.entity';
import { ExReq } from '../../common/middleware/auth.middleware';
import { ConflictException } from '@nestjs/common';
import { ArtistInfo } from './repository/entity/artist-info.entity';

const testUserList: SignUpDto[] = Array.from({ length: 10 }, (_, index) => {
  return {
    email: 'test' + index + '@gmail.com',
    username: 'test' + index,
    password: 'test',
  };
});

const insertUser = (id, { email, username, password }) => {
  return `
  INSERT INTO public."user" (
  id, email, username, password)
  VALUES (${id}, '${email}', '${username}', '${password}'
  );
  `;
};

describe('UserService', () => {
  let pgMemInstance: PgMem;
  let userSerivce: UserService;

  beforeAll(async () => {
    pgMemInstance = await startPgMem();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        pgMemInstance.repositorys['User'],
        pgMemInstance.repositorys['ArtistInfo'],
      ],
    }).compile();

    userSerivce = module.get<UserService>(UserService);

    for (const [index, testUser] of testUserList.entries()) {
      await pgMemInstance.query(insertUser(index + 1, testUser));
    }

    pgMemInstance.makeBackup();
  });

  afterEach(async () => {
    pgMemInstance.restore();
  });

  //getUser메서드에서 일부 필드를 제외하고 내보내지만,
  //class-transformer를 거친 이후에도 User의 인스턴스임.
  //getUser에서 내보내는 필드의 종류가 바뀔 수 있어서,
  //특정 필드가 잘 나왔는지 세부적으로 expect 체크하는건 시기상조임.
  //지금은 User의 instance인지만 체크하는걸로.
  //그래도 중요정보 ex) 앱손디바이스 같은건 expose안하는지 체크는 하자.
  it('should get user', async () => {
    const user = await userSerivce.getUser(4);
    expect(user).toBeInstanceOf(User);
    expect(user.epsonDevice).toBeUndefined();
  });

  it('should get my', async () => {
    const req = {
      user: { userId: 4 },
    } as ExReq;
    const user = await userSerivce.getMy(req);
    expect(user).toBeInstanceOf(User);
    expect(user.epsonDevice).toBeDefined();
  });

  //중요정보 ex) 앱손디바이스 같은건 expose안하는지 체크
  //TODO 지금은 dev단계라서, admin이 아닌 유저가 요청해도 오류 안던짐.
  //TODO 추후 admin아닌 유저 요청시 toThrow 체크 추가
  it('should upgrade user and get artist', async () => {
    const req = {
      user: { role: 'admin' },
    } as ExReq;
    const upgradedUser = await userSerivce.upgradeToArtist(req, 5);
    expect(upgradedUser).toBeInstanceOf(User);
    expect(upgradedUser.epsonDevice).toBeUndefined();
    await expect(userSerivce.upgradeToArtist(req, 5)).rejects.toThrow(
      ConflictException //이미 artist 라는 오류 뱉어야함.
    );

    const artistInfo = await userSerivce.getArtist(5);
    expect(artistInfo).toBeInstanceOf(ArtistInfo);
    expect(artistInfo.user.epsonDevice).toBeUndefined();
  });
});
