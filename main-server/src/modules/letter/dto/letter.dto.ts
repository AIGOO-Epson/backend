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

class SentLetter extends Letter {
  @ApiProperty({ type: User })
  receiver: User;
}

export class GetSentLetterResDto {
  @ApiProperty({ type: [SentLetter] })
  sentLetters: SentLetter[];
}

export class ReceivedLetter extends Letter {
  @ApiProperty({ type: User })
  sender: User;
}

export class GetReceivedLetterResDto {
  @ApiProperty({ type: [ReceivedLetter] })
  receivedLetters: ReceivedLetter;
}
