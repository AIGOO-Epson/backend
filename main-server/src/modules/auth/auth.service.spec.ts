import { TestingModule, Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from '../user/repository/user.repository';
import { AuthService } from './auth.service';
import { PgMem, startPgMem } from '../../config/db/pg-mem';
import { SignUpDto } from './dto/auth.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const testUser: SignUpDto = {
  email: 'test@gmail.com',
  username: 'test',
  password: 'test',
};

describe('AuthService', () => {
  let pgMemInstance: PgMem;
  let authService: AuthService;
  let testUserAccessToken: string;

  beforeAll(async () => {
    pgMemInstance = await startPgMem();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
          signOptions: {
            expiresIn: '7d',
          },
        }),
      ],
      providers: [
        AuthService,
        UserRepository,
        pgMemInstance.repositorys['User'],
        { provide: 'ArtistInfoRepository', useValue: jest.fn },
        //이 불필요한 의존성이 마음에 안들지만...
        //이런거 하나하나마다 새로운 모듈생성하는건 복잡도가 너무 증가한다..
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    await authService.signUp(testUser);

    pgMemInstance.makeBackup();
  });

  afterEach(async () => {
    pgMemInstance.restore();
  });

  it('should signup, throw conflict exception', async () => {
    const testUser2: SignUpDto = {
      email: 'mock@mail.com',
      username: 'mock',
      password: 'mock',
    };

    await expect(authService.signUp(testUser)).rejects.toThrow(
      ConflictException
    );
    const signUpRes = await authService.signUp(testUser2);
    expect(signUpRes.email).toBe(testUser2.email);
    await expect(authService.signUp(testUser2)).rejects.toThrow(
      ConflictException
    );
  });

  it('should signin and get payload', async () => {
    const res = {
      cookie: jest.fn(),
    };

    const succeedSignInRes = await authService.signIn(testUser, res);
    expect(succeedSignInRes.success).toBe(true);
    expect(succeedSignInRes.username).toBe(testUser.username);
    testUserAccessToken = succeedSignInRes.accessToken; //set accessToken
    await expect(
      authService.signIn({ email: 'fail@mail.com', password: 'test' }, res)
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      authService.signIn({ email: 'test@gmail.com', password: 'fail' }, res)
    ).rejects.toThrow(UnauthorizedException);
  });

  it('shoud succed, failed JwtCertifiaction', async () => {
    const req = {
      cookies: {
        Authorization: testUserAccessToken,
      },
    };
    const mockReq = {
      cookies: {
        Authorization: testUserAccessToken + 1,
      },
    };
    const res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const certificationRes = await authService.certificateJWT(req, res);
    expect(certificationRes.username).toBe(testUser.username);
    await expect(authService.certificateJWT(mockReq, res)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
