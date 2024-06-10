import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class TextPage extends Document {
  @Prop({ default: 'text' })
  type: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: [String] })
  originalText: string;

  @Prop({ type: [String] })
  translatedText: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TextPageSchema = SchemaFactory.createForClass(TextPage);
