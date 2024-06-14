import { TestingModule, Test } from '@nestjs/testing';
import { ExReq } from '../../common/middleware/auth.middleware';
import { PgMem, startPgMem } from '../../config/db/pg-mem';
import { SignUpDto } from '../auth/dto/auth.dto';
import { UserRoleEnum } from '../user/repository/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from '../user/user.service';
import { LetterService } from './letter.service';
import { LetterRepository } from './repository/letter.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMem, startMongoMem } from '../../config/db/mongo-mem';
import { HttpException } from '@nestjs/common';
import { Letter } from './repository/letter.entity';

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

const upgradeUser = (userId) => {
  return `
  UPDATE public."user"
	SET role='artist'
	WHERE id=${userId};
  `;
};

describe('LetterServie', () => {
  let pgMemInstance: PgMem;
  let mongoMem: MongoMem;
  let letterService: LetterService;

  beforeAll(async () => {
    pgMemInstance = await startPgMem();
    mongoMem = await startMongoMem();

    //????? 컨테이너에서는 mongo mem이 생성이 안됨.
    //There is no official build of MongoDB for Alpine! 라고 warn 뜸.
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoMem.uri)],
      providers: [
        LetterService,
        LetterRepository,
        UserService,
        UserRepository,
        pgMemInstance.repositorys['Letter'],
        pgMemInstance.repositorys['User'],
        pgMemInstance.repositorys['ArtistInfo'],
        mongoMem.models.letter,
      ],
    }).compile();

    letterService = module.get<LetterService>(LetterService);

    for (const [index, testUser] of testUserList.entries()) {
      //1~10생성
      await pgMemInstance.query(insertUser(index + 1, testUser));
    }

    // Array.from({ length: 5 }, async (_, index) => {
    // await pgMemInstance.query(upgradeUser(index + 1 + 5));
    // }); //await 되나?
    const sixToTen = Array.from({ length: 5 }, (_, index) => {
      return index + 1 + 5;
    });
    for (const index of sixToTen) {
      //6~10은 artist
      await pgMemInstance.query(upgradeUser(index));
    }

    pgMemInstance.makeBackup();
  });

  afterEach(async () => {
    pgMemInstance.restore();
  });

  it('send letter', async () => {
    // console.log(await pgMemInstance.query('SELECT * FROM public."user"'));
    const generalUser = {
      user: {
        userId: 1,
        role: UserRoleEnum.GENERAL,
      },
    } as ExReq;
    const artistUser = {
      user: {
        userId: 6,
        role: UserRoleEnum.GENERAL,
      },
    } as ExReq;
    const successRes = await letterService.sendLetter(generalUser, 8, 'test');
    expect(successRes.success).toBe(true);

    //cannot send to not exist
    await expect(
      letterService.sendLetter(generalUser, 100, 'test')
    ).rejects.toThrow(HttpException);

    //cannot send to u
    await expect(
      letterService.sendLetter(generalUser, 1, 'test')
    ).rejects.toThrow(HttpException);

    //general cannot send to general
    await expect(
      letterService.sendLetter(generalUser, 2, 'test')
    ).rejects.toThrow(HttpException);

    //artist can send to general
    const successRes2 = await letterService.sendLetter(artistUser, 8, 'test');
    expect(successRes2.success).toBe(true);

    const allLetters: Letter[] = await pgMemInstance.query(
      'SELECT * FROM public."letter"'
    );
    expect(allLetters.length).toBe(2);
  });
});

it('get letter', async () => {});
