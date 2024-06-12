import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import {
  User,
  UserRoleEnum,
  ValidationUserGroup,
} from './repository/entity/user.entity';
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
    return this.validateAndExposeUser(user, [
      ValidationUserGroup.GET_MY,
      ValidationUserGroup.GET_USER,
    ]);
  }

  async getUser(userId: number) {
    const user = await this.userRepository.userOrm.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.validateAndExposeUser(user, [ValidationUserGroup.GET_USER]);
  }

  async getArtist(userId: number) {
    const artistInfo = await this.userRepository.artistInfoOrm.findOne({
      where: { user: { id: userId } },
    });
    if (!artistInfo) {
      throw new NotFoundException('artist not found');
    }
    const arist = await this.validateAndExposeUser(artistInfo.user, [
      ValidationUserGroup.GET_USER,
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

    user.role = UserRoleEnum.ARTIST;
    const artistInfo = new ArtistInfo();
    artistInfo.user = user;
    //TODO 트랜잭션?
    await this.userRepository.artistInfoOrm.save(artistInfo);
    await this.userRepository.userOrm.save(user);

    return user;
  }

  async validateAndExposeUser(user: User, groups: ValidationUserGroup[]) {
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
