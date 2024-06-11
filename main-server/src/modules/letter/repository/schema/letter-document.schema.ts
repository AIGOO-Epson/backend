import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { PicturePage, TextPage } from './page.schema';

export type LetterDocument = HydratedDocument<Letter>;

@Schema()
export class Letter {
  // @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({
    required: true,
    type: [Object],
  })
  pages: (PicturePage | TextPage)[];

  @Prop({ required: true, type: Number })
  letterId: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LetterSchema = SchemaFactory.createForClass(Letter);
