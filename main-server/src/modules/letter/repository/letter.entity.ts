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
import { IsDate, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Letter extends BaseEntity {
  @ApiProperty()
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @Column()
  title: string;

  @ApiProperty()
  @IsString()
  @Column()
  letterDocumentId: string;

  // @IsNotEmptyObject({}, { groups: ['getSender'] })
  @ManyToOne(() => User, (user) => user.sentLetters)
  sender: User;

  /**null이면 모든 팬에게 publish */
  // @IsNotEmptyObject({}, { groups: ['getReceiver'] })
  //null과 notempty는 공존할수 없는데? 이렇게 하는건 이상하다. 그냥 서비스에서 유효성검사 따로 수행
  // @IsOptional({ groups: ['getReceiver'] }) //null 가능
  @ManyToOne(() => User, (user) => user.receivedLetters, { nullable: true })
  receiver: User;

  @ApiProperty()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // @IsInstance(StudyData, { each: true })
  @OneToMany(() => StudyData, (studyData) => studyData.letterFrom)
  studyDatas: StudyData[];
}
