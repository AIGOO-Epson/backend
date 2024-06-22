import { Injectable } from '@nestjs/common';
import { LetterDocument } from './schema/letter-document.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Letter } from './letter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewLetterForm } from '../dto/letter.dto';

@Injectable()
export class LetterRepository {
  constructor(
    @InjectRepository(Letter)
    public readonly letterOrm: Repository<Letter>,
    @InjectModel('Letter')
    public readonly letterModel: Model<LetterDocument>
  ) {}

  createLetter(letterForm: NewLetterForm) {
    const { senderId, receiver, title, letterDocumentId, status } = letterForm;

    const newLetter: Partial<Letter> = {
      receiver,
      title,
      letterDocumentId: letterDocumentId
        ? letterDocumentId.toString()
        : undefined,
      status,
    };

    return this.letterOrm.save({ ...newLetter, sender: { id: senderId } });
  }
}
