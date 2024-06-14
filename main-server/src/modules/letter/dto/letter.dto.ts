import { IsString } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../user/repository/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SendLetterDto {
  @ApiProperty()
  @IsString()
  title: string;
}

export interface NewLetterForm {
  senderId: number;
  receiver: User;
  letterDocumentId: Types.ObjectId;
  title: string;
}
