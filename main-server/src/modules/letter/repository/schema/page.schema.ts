import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum PageKind {
  PICTURE = 'picture',
  TEXT = 'text',
}

@Schema({ _id: false })
export class Page {
  @ApiProperty()
  @Prop({ type: String, required: true })
  type: PageKind;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PageSchema = SchemaFactory.createForClass(Page);

@Schema()
export class PicturePage extends Page {
  @ApiProperty()
  @Prop({ required: true, type: String })
  url: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PicturePageSchema = SchemaFactory.createForClass(PicturePage);

@Schema()
export class TextPage extends Page {
  @ApiProperty()
  @Prop({ required: true })
  url: string;

  @ApiProperty()
  @Prop({ type: [String] })
  originText: string[];

  @ApiProperty()
  @Prop({ type: [String] })
  translatedText: string[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TextPageSchema = SchemaFactory.createForClass(TextPage);
