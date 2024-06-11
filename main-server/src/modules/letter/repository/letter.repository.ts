import { Injectable } from '@nestjs/common';
import { LetterDocument } from './schema/letter-document.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PageKind, PicturePage, TextPage } from './schema/page.schema';

@Injectable()
export class LetterRepository {
  constructor(
    @InjectModel('Letter')
    public readonly letterModel: Model<LetterDocument>
  ) {
    // this.testCreate();
  }

  async testCreate() {
    const textPage: TextPage = {
      type: PageKind.PICTURE,
      url: 'txt',
      originalText: ['txt'],
      translatedText: ['trans txt'],
    };

    const picPage: PicturePage = {
      type: PageKind.TEXT,
      url: 'pic',
    };
    const letter = new this.letterModel({
      letterId: 1,
      pages: [textPage, picPage],
    });
    await letter.save();
  }
}
