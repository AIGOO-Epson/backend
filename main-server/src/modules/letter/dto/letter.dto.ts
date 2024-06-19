import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../user/repository/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Letter, LetterDocumentStatus } from '../repository/letter.entity';
import { Transform } from 'class-transformer';
import { PageKind } from '../repository/schema/page.schema';
import { SimpleSuccessDto } from '../../../common/common.dto';
import { Letter as LetterDocument } from '../repository/schema/letter-document.schema';

export class SendLetterDto {
  @ApiProperty()
  @IsString()
  title: string;

  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @ApiProperty({
    enum: PageKind,
    isArray: true,
    description: 'list value should "text" or "picture"',
  })
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^(text|picture)$/, {
    each: true,
    message: 'pageTypes value must be `text` or `picture`',
  })
  pageTypes: PageKind[];
}

export class SendLetterByScanDto {
  @ApiProperty()
  @IsString()
  title: string;
}

export class ProcessScanResultParams {
  @IsUUID('4')
  uuid: string;

  @IsString()
  letterDocumentId: string;
}

export interface NewLetterForm {
  senderId: number;
  receiver: User;
  letterDocumentId: Types.ObjectId;
  title: string;
  status: LetterDocumentStatus;
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

export class SendLetterResDto extends SimpleSuccessDto {
  @ApiProperty({ description: 'objectId' })
  letterDocumentId: string;
}

export class GetLetterParams {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  letterDocumentId: string;
}

class LetterContainsBothUser extends Letter {
  @ApiProperty({ type: User })
  sender: User;

  @ApiProperty({ type: User })
  receiver: User;
}

export class GetLetterResDto {
  @ApiProperty()
  letter: LetterContainsBothUser;

  @ApiProperty()
  letterDocument: LetterDocument;
}
