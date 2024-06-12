import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PicturePage {
  @Prop({ default: 'picture', type: String })
  type: string;

  @Prop({ required: true, type: String })
  url: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PicturePageSchema = SchemaFactory.createForClass(PicturePage);
