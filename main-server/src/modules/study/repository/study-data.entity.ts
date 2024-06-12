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

@Entity()
export class StudyData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array')
  keywords: string[];

  @Column()
  title: string;

  @Column()
  url: string;

  @ManyToOne(() => User, (user) => user.studyData)
  owner: User;

  @ManyToOne(() => Letter, (letter) => letter.studyDatas)
  letterFrom: Letter;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
