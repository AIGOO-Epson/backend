import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PageKind {
  PICTURE = 'picture',
  TEXT = 'text',
}

@Schema({ _id: false })
export class Page {
  @Prop({ type: String, required: true })
  type: PageKind;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PageSchema = SchemaFactory.createForClass(Page);

@Schema()
export class PicturePage extends Page {
  @Prop({ required: true, type: String })
  url: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PicturePageSchema = SchemaFactory.createForClass(PicturePage);

@Schema()
export class TextPage extends Page {
  @Prop({ required: true })
  url: string;

  @Prop({ type: [String] })
  originalText: string[];

  @Prop({ type: [String] })
  translatedText: string[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TextPageSchema = SchemaFactory.createForClass(TextPage);
