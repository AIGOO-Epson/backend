import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.following)
  follower: User;

  @ManyToOne(() => User, (user) => user.followers)
  followed: User;
}
