import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { ExReq } from '../../../common/middleware/auth.middleware';
import { UserRepository } from '../repository/user.repository';
import {
  UserRoleEnum,
  ValidationUserGroup,
} from '../repository/entity/user.entity';
import { UserService } from '../user.service';

@Injectable()
export class FollowService {
  constructor(
    private followRepository: FollowRepository,
    private userService: UserService,
    private userRepository: UserRepository
  ) {}

  async getFollow(req: ExReq) {
    const follows = await this.followRepository.followOrm.find({
      where: {
        userFrom: { id: req.user.userId },
      },
      relations: ['userTo'],
      order: {
        followedAt: 'DESC', //최근 추가한 순서대로
      },
    });

    const followingUserList = await Promise.all(
      follows.map(async (follow) => {
        return {
          followedAt: follow.followedAt,
          artist: await this.userService.validateAndExposeUser(follow.userTo, [
            ValidationUserGroup.GET_USER,
          ]),
        };
      })
    );
    return {
      followList: followingUserList,
    };
  }

  async addFollow(req: ExReq, targetId: number) {
    if (req.user.userId === targetId) {
      throw new BadRequestException('origin, target are same');
    }

    const followForm = {
      userFrom: { id: req.user.userId },
      userTo: { id: targetId },
    };

    const isAlreadyFollow =
      await this.followRepository.followOrm.findOneBy(followForm);

    if (isAlreadyFollow) {
      throw new ConflictException('already followed');
    }

    const targetUser = await this.userRepository.userOrm.findOneBy({
      id: targetId,
    });

    if (!targetUser || targetUser.role !== UserRoleEnum.ARTIST) {
      throw new NotFoundException('target not found or target is not artist');
    }

    await this.followRepository.followOrm.save(followForm);
    return { success: true };
  }

  async removeFollow(req: ExReq, targetId: number) {
    if (req.user.userId === targetId) {
      throw new BadRequestException('origin, target are same');
    }

    const followForm = {
      userFrom: { id: req.user.userId },
      userTo: { id: targetId },
    };

    await this.followRepository.followOrm.delete(followForm);
    return { success: true };
  }
}
