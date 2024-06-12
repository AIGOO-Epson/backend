import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInstance, IsString } from 'class-validator';

@Entity()
export class ArtistInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Expose()
  @IsString()
  @Column({ default: '' })
  bannerUrl: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @Column({ default: '' })
  introduce: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @Column({ default: '' })
  fandomName: string;

  @ApiProperty({ type: User })
  @IsInstance(User)
  @Expose()
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;
}
