import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { Follow } from './repository/entity/follow.entity';
import { User } from './repository/entity/user.entity';
import { FollowService } from './follow/follow.service';
import { FollowController } from './follow/follow.controller';
import { UserCurdService } from './crud.service';
import { ArtistController } from './artist/artist.controller';
import { ArtistService } from './artist/artist.service';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { FollowRepository } from './repository/follow.repository';
import { ArtistRepository } from './repository/artist.repository';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, ArtistInfo]), UploadModule],
  controllers: [UserController, FollowController, ArtistController],
  providers: [
    UserCurdService,
    UserService,
    ArtistService,
    ArtistRepository,
    UserRepository,
    FollowService,
    FollowRepository,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
