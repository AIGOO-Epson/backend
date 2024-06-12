import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  Generated,
  BaseEntity,
} from 'typeorm';
import { Letter } from '../../../letter/repository/letter.entity';
import { StudyData } from '../../../study/repository/study-data.entity';
import { Follow } from './follow.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { Crypto } from '../../../../common/crypter';
export enum UserRole {
  GENERAL = 'general',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

/**아티스트를 다중 팔로우 하는걸로 생각하고 짰음. */
@Entity()
export class User extends BaseEntity {
  @ApiProperty({ description: 'encrypted', type: String })
  @IsNumber({}, { groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Transform(
    ({ value }) => {
      return Crypto.encrypt(value);
    },
    { groups: ['getUser'] }
  )
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsUUID('4', { groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Column()
  @Generated('uuid')
  uuid: string;

  @ApiProperty()
  @IsString({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
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
  @Column({ default: '' })
  epsonDevice: string;

  @ApiProperty({ enum: UserRole })
  @IsString({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @Column({
    default: UserRole.GENERAL,
  })
  role: UserRole;

  @ApiProperty()
  @IsDate({ groups: ['getUser'] })
  @Expose({ groups: ['getUser'] })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  myFavorite: User | null;

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
