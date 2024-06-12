import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.following)
  userTo: User;

  @ManyToOne(() => User, (user) => user.followers)
  userFrom: User;

  @CreateDateColumn({ type: 'timestamp' })
  followedAt: Date;
}
