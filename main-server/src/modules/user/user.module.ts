import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { ArtistInfo } from './repository/entity/artist-info.entity';
import { Follow } from './repository/entity/follow.entity';
import { User } from './repository/entity/user.entity';
import { CurdService } from './crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, ArtistInfo])],
  controllers: [UserController],
  providers: [UserService, UserRepository, CurdService],
  exports: [UserRepository],
})
export class UserModule {}
