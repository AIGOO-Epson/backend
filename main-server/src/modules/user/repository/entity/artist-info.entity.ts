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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ArtistInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @ApiProperty()
  @Column({ default: '' })
  bannerUrl: string;

  @ApiProperty()
  @Column({ default: '' })
  introduce: string;

  @ApiProperty()
  @Column({ default: '' })
  fandomName: string;

  @ApiProperty({ type: User })
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;
}
