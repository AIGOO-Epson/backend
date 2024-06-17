import { TestingModule, Test } from '@nestjs/testing';
import { ExReq } from '../../common/middleware/auth.middleware';
import { PgMem, startPgMem } from '../../config/db/pg-mem';
import { SignUpDto } from '../auth/dto/auth.dto';
import { User, UserRoleEnum } from '../user/repository/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from '../user/user.service';
import { LetterService } from './letter.service';
import { LetterRepository } from './repository/letter.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMem, startMongoMem } from '../../config/db/mongo-mem';
import { HttpException } from '@nestjs/common';
import { Letter } from './repository/letter.entity';

//TODO 레터 테스트는 더 작성해야할 부분이 많이보임. 추후에 계속 추가

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

const generalUser1 = {
  user: {
    userId: 1,
    role: UserRoleEnum.GENERAL,
  },
} as ExReq;
const artistUser6 = {
  user: {
    userId: 6,
    role: UserRoleEnum.GENERAL,
  },
} as ExReq;

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

  //TODO sendLetter방식이, 스캔에서 유저업로드로 변경되고, 아래 테스트는 못씀.
  it('send letter', async () => {
    // console.log(await pgMemInstance.query('SELECT * FROM public."user"'));

    const successRes = await letterService.sendLetter(generalUser1, 8, 'test');
    expect(successRes.success).toBe(true);

    //cannot send to not exist
    await expect(
      letterService.sendLetter(generalUser1, 100, 'test')
    ).rejects.toThrow(HttpException);

    //cannot send to u
    await expect(
      letterService.sendLetter(generalUser1, 1, 'test')
    ).rejects.toThrow(HttpException);

    //general cannot send to general
    await expect(
      letterService.sendLetter(generalUser1, 2, 'test')
    ).rejects.toThrow(HttpException);

    //artist can send to general
    const successRes2 = await letterService.sendLetter(artistUser6, 8, 'test');
    expect(successRes2.success).toBe(true);

    const allLetters: Letter[] = await pgMemInstance.query(
      'SELECT * FROM public."letter"'
    );
    expect(allLetters.length).toBe(2);
  });

  //TODO 나중에 고도화 한다면, 내가 팔로우하는 artist가 publish한 레터도 가져와야함.
  //TODO publish한 레터의 유저는 null임, 거기에 대응하는 test도 필요
  //TODO sendLetter방식이, 스캔에서 유저업로드로 변경되고, 아래 테스트는 못씀.
  it('get letter', async () => {
    //편지 보낸다.
    await letterService.sendLetter(generalUser1, 6, 'test');
    await letterService.sendLetter(generalUser1, 6, 'test');
    await letterService.sendLetter(generalUser1, 6, 'test'); //6한테 3번
    await letterService.sendLetter(generalUser1, 7, 'test'); //7한테 2번
    await letterService.sendLetter(generalUser1, 7, 'test');
    await letterService.sendLetter(generalUser1, 8, 'test');
    await letterService.sendLetter(generalUser1, 9, 'test');
    await letterService.sendLetter(generalUser1, 10, 'test'); //8번

    //가져온다
    const { sentLetters } = await letterService.getSentLetters(generalUser1);
    expect(sentLetters.length).toBe(8);
    expect(sentLetters[0]).toBeInstanceOf(Letter);
    expect(sentLetters[0].receiver).toBeInstanceOf(User);
    //sender undefined when get sent letter
    expect(sentLetters[0].sender).toBeUndefined();

    const { receivedLetters } =
      await letterService.getReceivedLetters(artistUser6);
    expect(receivedLetters.length).toBe(3);
    expect(receivedLetters[0]).toBeInstanceOf(Letter);
    expect(receivedLetters[0].sender).toBeInstanceOf(User);
    //receiver undefined when get received letter
    expect(receivedLetters[0].receiver).toBeUndefined();

    //TODO 아티스트가 publish하는 기능을 만들었다면 아티스트가 get sent letter
    //TODO 해서 가져온 reciever는 null일수 있음을 test 추가
  });
});
