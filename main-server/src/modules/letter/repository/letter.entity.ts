import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { StudyData } from '../../study/repository/study-data.entity';
import { User } from '../../user/repository/entity/user.entity';

@Entity()
export class Letter extends BaseEntity {
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
