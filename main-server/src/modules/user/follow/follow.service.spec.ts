import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ExReq } from '../../../common/middleware/auth.middleware';
import { PgMem, startPgMem } from '../../../config/db/pg-mem';
import { SignUpDto } from '../../auth/dto/auth.dto';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../user.service';
import { FollowRepository } from './follow.repository';
import { FollowService } from './follow.service';
import { User } from '../repository/entity/user.entity';

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

describe('FollowService', () => {
  let pgMemInstance: PgMem;
  let followService: FollowService;

  beforeAll(async () => {
    pgMemInstance = await startPgMem();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        FollowRepository,
        UserService,
        UserRepository,
        pgMemInstance.repositorys['User'],
        pgMemInstance.repositorys['ArtistInfo'],
        pgMemInstance.repositorys['Follow'],
      ],
    }).compile();

    followService = module.get<FollowService>(FollowService);

    for (const [index, testUser] of testUserList.entries()) {
      await pgMemInstance.query(insertUser(index + 1, testUser));
    }

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

  it('should follow user', async () => {
    const followResult = await followService.addFollow(
      { user: { userId: 1 } } as ExReq,
      6
    );
    expect(followResult).toEqual({ success: true });

    /**throw because same user*/
    await expect(
      followService.addFollow({ user: { userId: 1 } } as ExReq, 1)
    ).rejects.toThrow(BadRequestException);

    /**throw because already followed */
    await expect(
      followService.addFollow({ user: { userId: 1 } } as ExReq, 6)
    ).rejects.toThrow(ConflictException);

    /**throw because  user 3 is not artist*/
    await expect(
      followService.addFollow({ user: { userId: 1 } } as ExReq, 3)
    ).rejects.toThrow(NotFoundException);

    /**throw because  user 100 not found*/
    await expect(
      followService.addFollow({ user: { userId: 1 } } as ExReq, 100)
    ).rejects.toThrow(NotFoundException);
  });

  it('should get following user', async () => {
    await followService.addFollow({ user: { userId: 1 } } as ExReq, 7);
    await followService.addFollow({ user: { userId: 1 } } as ExReq, 8);
    await followService.addFollow({ user: { userId: 1 } } as ExReq, 9);

    const result = await followService.getFollow({
      user: { userId: 1 },
    } as ExReq);
    expect(result.followList.length).toBe(3);
    for (const { followedAt, artist } of result.followList) {
      expect(followedAt).toBeInstanceOf(Date);
      expect(artist).toBeInstanceOf(User);
      //중요정보인 앱손디바이스 exclude 체크
      expect(artist.epsonDevice).toBeUndefined();
    }
  });

  it('should remove follow', async () => {
    await expect(
      followService.addFollow({ user: { userId: 1 } } as ExReq, 1)
    ).rejects.toThrow(BadRequestException);

    await followService.addFollow({ user: { userId: 1 } } as ExReq, 7);
    await followService.addFollow({ user: { userId: 1 } } as ExReq, 8);
    await followService.addFollow({ user: { userId: 1 } } as ExReq, 9);

    await followService.removeFollow({ user: { userId: 1 } } as ExReq, 7);
    await followService.removeFollow({ user: { userId: 1 } } as ExReq, 3);
    const result = await followService.getFollow({
      user: { userId: 1 },
    } as ExReq);
    expect(result.followList.length).toBe(2);

    //typeorm delete메서드를 써서 삭제를 했든 안했든
    //오류 안뱉음. success: true 체크는 생략
  });
});
