import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PicturePage } from './picture-page.schema';
import { TextPage } from './text-page.schema';

export type LetterDocumentDoc = HydratedDocument<LetterDocument>;
export type PageTypeUnion = TextPage | PicturePage;

@Schema()
export class LetterDocument extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true, type: [Object] })
  pages: PageTypeUnion[];

  @Prop({ required: true, type: Number })
  letterId: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LetterContentSchema = SchemaFactory.createForClass(LetterDocument);
