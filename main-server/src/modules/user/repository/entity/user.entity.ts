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
  IsEmail,
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
export enum ValidationUserGroup {
  GET_USER = 'getUser',
  GET_MY = 'getMy',
}

export type UserRole = 'general' | 'artist' | 'admin';

/**아티스트를 다중 팔로우 하는걸로 생각하고 짰음. */
@Entity()
export class User extends BaseEntity {
  @ApiProperty()
  @IsNumber({}, { groups: [ValidationUserGroup.GET_USER] })
  @Expose({ groups: [ValidationUserGroup.GET_USER] })
  @PrimaryGeneratedColumn()
  id: number;

  @IsUUID('4', { groups: [ValidationUserGroup.GET_MY] })
  @Expose({ groups: [ValidationUserGroup.GET_MY] })
  @Column()
  @Generated('uuid')
  uuid: string;

  @IsString({ groups: [ValidationUserGroup.GET_MY] })
  @Expose({ groups: [ValidationUserGroup.GET_MY] })
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @IsString({ groups: [ValidationUserGroup.GET_USER] })
  @Expose({ groups: [ValidationUserGroup.GET_USER] })
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ApiProperty()
  @IsOptional({ groups: [ValidationUserGroup.GET_USER] })
  @IsString({ groups: [ValidationUserGroup.GET_USER] })
  @Expose({ groups: [ValidationUserGroup.GET_USER] })
  @Column('varchar', { nullable: true })
  img: string | null;

  // @Column('simple-array', { nullable: true })
  // epsonDevice: string[];
  @IsEmail({}, { groups: [ValidationUserGroup.GET_MY] })
  @IsOptional({ groups: [ValidationUserGroup.GET_MY] })
  @Expose({ groups: [ValidationUserGroup.GET_MY] })
  @Column('varchar', { nullable: true })
  epsonDevice: string | null;

  @ApiProperty({ enum: UserRoleEnum })
  @IsString({ groups: [ValidationUserGroup.GET_USER] })
  @Expose({ groups: [ValidationUserGroup.GET_USER] })
  @Column({
    default: UserRoleEnum.GENERAL,
  })
  role: UserRole;

  @ApiProperty()
  @IsDate({ groups: [ValidationUserGroup.GET_USER] })
  @Expose({ groups: [ValidationUserGroup.GET_USER] })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @IsNumber({}, { groups: [ValidationUserGroup.GET_MY] })
  @IsOptional({ groups: [ValidationUserGroup.GET_MY] })
  @Expose({ groups: [ValidationUserGroup.GET_MY] })
  @Column('integer', { nullable: true })
  myFavorite: number | null; //참조키 안함

  @OneToMany(() => Letter, (letter) => letter.sender)
  sentLetters: Letter[];

  @OneToMany(() => Letter, (letter) => letter.receiver)
  receivedLetters: Letter[];

  @OneToMany(() => Follow, (follow) => follow.userFrom)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.userTo)
  followers: Follow[];

  @OneToMany(() => StudyData, (studyData) => studyData.letterFrom)
  studyData: StudyData;
}
