import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { User, UserRoleEnum } from './repository/entity/user.entity';
import { validateOrReject } from 'class-validator';
import { instanceToInstance } from 'class-transformer';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { ExReq } from '../../common/middleware/auth.middleware';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(private userRepository: UserRepository) {}

  async getMy(@Req() req: ExReq) {
    const user = await this.userRepository.userOrm.findOneBy({
      id: req.user.userId,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.validateAndExposeUser(user, ['getMy', 'getUser']);
  }

  async getUser(userId: number) {
    const user = await this.userRepository.userOrm.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.validateAndExposeUser(user, ['getUser']);
  }

  async getArtist(userId: number) {
    const artistInfo = await this.userRepository.artistInfoOrm.findOne({
      where: { user: { id: userId } },
    });
    if (!artistInfo) {
      throw new NotFoundException('artist not found');
    }
    const arist = await this.validateAndExposeUser(artistInfo.user, [
      'getUser',
    ]);

    return { ...artistInfo, user: arist, id: undefined };
  }

  async upgradeToArtist(req: ExReq, userId: number) {
    //TODO 나중엔 주석해제
    // if (req.user.role !== UserRoleEnum.ADMIN) {
    //   throw new UnauthorizedException('cannot access');
    // }

    const user = await this.getUser(userId);
    if (user.role === UserRoleEnum.ARTIST) {
      throw new ConflictException('user role is already artist');
    }

    user.role = 'artist';
    const artistInfo = new ArtistInfo();
    artistInfo.user = user;
    //TODO 트랜잭션?
    await this.userRepository.artistInfoOrm.save(artistInfo);
    await this.userRepository.userOrm.save(user);

    return user;
  }

  private async validateAndExposeUser(user: User, groups: string[]) {
    await validateOrReject(user, { groups }).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException('validation err');
    });

    const result = instanceToInstance(user, {
      groups,
      excludeExtraneousValues: true,
    });

    return result;
  }
}
