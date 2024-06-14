import { IsString } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../user/repository/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Letter } from '../repository/letter.entity';

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

export class GetSentLetterResDto extends Letter {
  @ApiProperty({ type: User })
  receiver: User;
}

export class GetReceivedLetterResDto extends Letter {
  @ApiProperty({ type: User })
  sender: User;
}
