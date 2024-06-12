import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Generated,
  BaseEntity,
} from 'typeorm';
import { Letter } from '../../../letter/repository/letter.entity';
import { StudyData } from '../../../study/repository/study-data.entity';
import { Follow } from './follow.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Expose } from 'class-transformer';
export enum UserRoleEnum {
  GENERAL = 'general',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

export type UserRole = 'general' | 'artist' | 'admin';

/**아티스트를 다중 팔로우 하는걸로 생각하고 짰음. */
@Entity()
export class User extends BaseEntity {
  @ApiProperty()
  @IsNumber({}, { groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @PrimaryGeneratedColumn()
  id: number;

  // @ApiProperty()
  // @IsUUID('4', { groups: ['getUser'] })
  // @Expose({ groups: ['getUser'] })
  // @Column()
  // @Generated('uuid')
  // uuid: string;

  @IsString({ groups: ['getMy'] })
  @Expose({ groups: ['getMy'] })
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @IsString({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ApiProperty()
  @IsString({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Column({ default: '' })
  img: string;

  // @Column('simple-array', { nullable: true })
  // epsonDevice: string[];
  @IsString({ groups: ['getMy'] })
  @Expose({ groups: ['getMy'] })
  @Column({ default: '' })
  epsonDevice: string;

  @ApiProperty({ enum: UserRoleEnum })
  @IsString({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Column({
    default: UserRoleEnum.GENERAL,
  })
  role: UserRole;

  @ApiProperty()
  @IsDate({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @IsNumber({}, { groups: ['getMy'] })
  @IsOptional({ groups: ['getMy'] })
  @Expose({ groups: ['getMy'] })
  @Column({ nullable: true })
  myFavorite: number; //참조키 안함

  @OneToMany(() => Letter, (letter) => letter.sender)
  sentLetters: Letter[];

  @OneToMany(() => Letter, (letter) => letter.receiver)
  receivedLetters: Letter[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow[];

  @OneToMany(() => StudyData, (studyData) => studyData.letterFrom)
  studyData: StudyData;
}
