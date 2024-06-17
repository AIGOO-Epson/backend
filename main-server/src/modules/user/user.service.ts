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
import { UpsertEpsonDeviceParams } from './dto/user.dto';
import { SimpleSuccessDto } from '../../common/common.dto';

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

    const transFormedUser = await this.validateAndExposeUser(user, [
      ValidationUserGroup.GET_USER,
    ]);

    return transFormedUser;
  }

  async getArtist(userId: number) {
    const artistInfo = await this.userRepository.artistInfoOrm.findOne({
      where: { user: { id: userId } },
    });
    if (!artistInfo) {
      throw new NotFoundException('artist not found');
    }

    await validateOrReject(artistInfo).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException('validation err');
    });
    const validatedArtistInfo = instanceToInstance(artistInfo, {
      excludeExtraneousValues: true,
    });

    const artist = await this.validateAndExposeUser(artistInfo.user, [
      ValidationUserGroup.GET_USER,
    ]);
    //내보내도 될 정보만을 포함한걸로 갈아끼움.
    //이미 선언된 변수를 변경하는게 싫지만,
    validatedArtistInfo.user = artist;

    return validatedArtistInfo;
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

    return this.validateAndExposeUser(user, [ValidationUserGroup.GET_USER]);
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

  async upsertEpsonDeviceEmail(
    req: ExReq,
    params: UpsertEpsonDeviceParams
  ): Promise<SimpleSuccessDto> {
    try {
      await this.userRepository.userOrm.update(
        { id: req.user.userId },
        {
          epsonDevice: params.device,
        }
      );
    } catch {
      throw new InternalServerErrorException(
        'err while upsert epsondevice email'
      );
    }

    return { success: true };
  }
}
