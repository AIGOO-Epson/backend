import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/repository/user.entity';
import { StudyData } from '../../study/repository/study-data.entity';

@Entity()
export class Letter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  letterDocumentId: string;

  @ManyToOne(() => User, (user) => user.sentLetters)
  sender: User;

  /**null이면 모든 팬에게 publish */
  @ManyToOne(() => User, (user) => user.receivedLetters, { nullable: true })
  receiver: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => StudyData, (studyData) => studyData.letterFrom)
  studyDatas: StudyData;
}
