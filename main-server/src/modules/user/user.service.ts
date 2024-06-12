import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserRole } from './repository/entity/user.entity';
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

    await validateOrReject(user, { groups: ['getMy', 'getUser'] }).catch(
      (error) => {
        this.logger.error(error);
        throw new InternalServerErrorException('validation err');
      }
    );

    const returnedUser = instanceToInstance(user, {
      groups: ['getMy', 'getUser'],
      excludeExtraneousValues: true,
    });

    return returnedUser;
  }

  async getUser(userId: number) {
    const user = await this.userRepository.userOrm.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    console.log(user.myFavorite);

    await validateOrReject(user, { groups: ['getUser'] }).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException('validation err');
    });

    const returnedUser = instanceToInstance(user, {
      groups: ['getUser'],
      excludeExtraneousValues: true,
    });

    return returnedUser;
  }

  async getArtist(userId: number) {
    const artistInfo = await this.userRepository.artistInfoOrm.findOne({
      where: { user: { id: userId } },
    });
    if (!artistInfo) {
      throw new NotFoundException('artist not found');
    }
    const arist = artistInfo.user;

    await validateOrReject(arist, { groups: ['getUser'] }).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException('validation err');
    });

    const returnedArist = instanceToInstance(arist, {
      groups: ['getUser'],
      excludeExtraneousValues: true,
    });

    return { ...artistInfo, user: returnedArist, id: undefined };
  }

  async upgradeToArtist(userId: number) {
    const user = await this.userRepository.userOrm.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.role === UserRole.ARTIST) {
      throw new ConflictException('user role is already artist');
    }
    user.role = UserRole.ARTIST;

    const artistInfo = new ArtistInfo();
    artistInfo.user = user;
    //TODO 트랜잭션?
    await this.userRepository.artistInfoOrm.save(artistInfo);
    await this.userRepository.userOrm.save(user);

    return user;
  }
}
