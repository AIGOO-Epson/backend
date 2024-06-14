import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { Follow } from './repository/entity/follow.entity';
import { User } from './repository/entity/user.entity';
import { FollowService } from './follow/follow.service';
import { FollowRepository } from './follow/follow.repository';
import { FollowController } from './follow/follow.controller';
import { UserCurdService } from './crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, ArtistInfo])],
  controllers: [UserController, FollowController],
  providers: [
    UserCurdService,
    UserService,
    UserRepository,
    FollowService,
    FollowRepository,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
