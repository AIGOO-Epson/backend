import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Letter } from '../../letter/repository/letter.entity';
import { Follow } from './follow.entity';
import { StudyData } from '../../study/repository/study-data.entity';

export enum UserRole {
  GENERAL = 'general',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

/**아티스트를 다중 팔로우 하는걸로 생각하고 짰음. */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  img: string;

  @Column('simple-array', { nullable: true })
  epsonDevice: string[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GENERAL,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  myFavorite: User;

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
