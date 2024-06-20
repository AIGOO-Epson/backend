import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
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
import { ExReq } from '../../common/middleware/auth.middleware';
import { UpsertEpsonDeviceParams } from './dto/user.dto';
import { SimpleSuccessDto } from '../../common/common.dto';
import { UploadService } from '../upload/upload.module';
import { FollowService } from './follow/follow.service';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    private userRepository: UserRepository,
    @Inject('UploadService')
    private uploadService: UploadService,
    @Inject(forwardRef(() => FollowService))
    private followService: FollowService
  ) {}

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

  async updateUserImg(req: ExReq, file: Express.Multer.File) {
    try {
      const { fileUrl } = await this.uploadService.uploadFile(
        req.user.uuid,
        file
      );

      await this.userRepository.userOrm.update(
        {
          id: req.user.userId,
        },
        {
          img: fileUrl,
        }
      );

      return { success: true, url: fileUrl };
    } catch {
      throw new InternalServerErrorException('err while update user img');
    }
  }

  async upsertMyFavorite(req: ExReq, targetArtistId: number) {
    if (req.user.userId === targetArtistId) {
      throw new BadRequestException('origin, target are same');
    }

    const user = await this.userRepository.userOrm.findOne({
      where: {
        id: req.user.userId,
      },
    });
    const targetUser = await this.userRepository.userOrm.findOne({
      where: {
        id: targetArtistId,
      },
    });

    if (!user || !targetUser) {
      throw new NotFoundException('users not found');
    }
    if (user.myFavorite === targetArtistId) {
      //TODO 아니면 그냥 리턴 true?
      //return {success: true}
      throw new ConflictException('target is already my favorite');
    }
    //target이 아티스트가 아니다?
    if (targetUser.role !== UserRoleEnum.ARTIST) {
      throw new BadRequestException('target user is not artist');
    }

    //TODO 트랜잭션? 굳이?
    user.myFavorite = targetUser.id;
    await this.userRepository.userOrm.save(user);
    //이미 팔로우 돼 있으면 addFollow메서드는 에러나는데, 에러처리 버려버림.
    await this.followService.addFollow(req, targetArtistId).catch(() => {
      return;
    });

    return { success: true };
  }
}
