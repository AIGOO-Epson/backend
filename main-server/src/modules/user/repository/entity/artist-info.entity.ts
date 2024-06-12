import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ArtistInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ default: '' })
  bannerUrl: string;

  @Column({ default: '' })
  introduce: string;

  @Column({ default: '' })
  fandomName: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;
}
