import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { UserRepository } from '../repository/user.repository';
import { ExReq } from '../../../common/middleware/auth.middleware';
import {
  UserRoleEnum,
  ValidationUserGroup,
} from '../repository/entity/user.entity';
import { ArtistRepository } from '../repository/artist.repository';
import { ArtistInfo } from '../repository/entity/artist-info.entity';
import { instanceToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class ArtistService {
  private logger = new Logger(ArtistService.name);

  constructor(
    private userService: UserService,
    private userRepository: UserRepository,
    private artistRepository: ArtistRepository
  ) {}

  async upgradeToArtist(req: ExReq, userId: number) {
    //TODO 나중엔 주석해제
    // if (req.user.role !== UserRoleEnum.ADMIN) {
    //   throw new UnauthorizedException('cannot access');
    // }

    const user = await this.userService.getUser(userId);
    if (user.role === UserRoleEnum.ARTIST) {
      throw new ConflictException('user role is already artist');
    }

    user.role = UserRoleEnum.ARTIST;
    const artistInfo = new ArtistInfo();
    artistInfo.user = user;
    //TODO 트랜잭션?
    await this.artistRepository.artistInfoOrm.save(artistInfo);
    await this.userRepository.userOrm.save(user);

    return this.userService.validateAndExposeUser(user, [
      ValidationUserGroup.GET_USER,
    ]);
  }

  async getArtist(userId: number) {
    const artistInfo = await this.artistRepository.artistInfoOrm.findOne({
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

    const artist = await this.userService.validateAndExposeUser(
      artistInfo.user,
      [ValidationUserGroup.GET_USER]
    );
    //내보내도 될 정보만을 포함한걸로 갈아끼움.
    //이미 선언된 변수를 변경하는게 싫지만,
    validatedArtistInfo.user = artist;

    return validatedArtistInfo;
  }
}
