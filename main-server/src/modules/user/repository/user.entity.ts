import { GROUP } from '@nestjs-library/crud';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @ApiProperty()
  @IsNumber({}, { groups: [GROUP.READ_ONE] })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString({ groups: [GROUP.CREATE] })
  @IsNotEmpty({ groups: [GROUP.CREATE] })
  @Column()
  username: string;

  @ApiProperty()
  @IsEmail({}, { groups: [GROUP.CREATE] })
  @Column()
  email: string;
}
