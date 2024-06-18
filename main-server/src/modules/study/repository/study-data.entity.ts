import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Letter } from '../../letter/repository/letter.entity';
import { User } from '../../user/repository/entity/user.entity';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

@Entity()
export class StudyData extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString({ each: true })
  @Expose()
  @Column('simple-array')
  keywords: string[];

  @ApiProperty()
  @IsString()
  @Expose()
  @Column()
  title: string;

  @ApiProperty()
  @IsString()
  @Expose()
  @Column()
  url: string;

  @Type(() => User)
  @ManyToOne(() => User, (user) => user.studyData)
  owner: User;

  @Type(() => Letter)
  @ManyToOne(() => Letter, (letter) => letter.studyDatas)
  letterFrom: Letter;

  @ApiProperty()
  @IsDate()
  @Expose()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
