import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { PicturePage, TextPage } from './page.schema';
import { ApiProperty } from '@nestjs/swagger';

export type LetterDocument = HydratedDocument<Letter>;

export enum LetterDocumentStatus {
  FAILED = 'failed',
  SUCCESS = 'success',
  PENDING = 'pending',
}

@Schema()
export class Letter {
  // @Prop({ type: MongooseSchema.Types.ObjectId })
  @ApiProperty({ type: String, description: 'ObjectId' })
  _id: Types.ObjectId;

  @ApiProperty({
    type: TextPage,
    isArray: true,
  }) //type이 스웨거에 잘 표시 안되서 일단 한개만 올려놨음.
  @Prop({
    required: true,
    type: [Object],
  })
  pages: (PicturePage | TextPage)[];

  @ApiProperty()
  @Prop({ required: true, type: Number })
  letterId: number;

  @ApiProperty()
  @Prop({ required: true, type: String })
  status: LetterDocumentStatus;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LetterSchema = SchemaFactory.createForClass(Letter);
