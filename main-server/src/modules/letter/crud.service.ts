import { Injectable } from '@nestjs/common';
import { Letter } from './repository/letter.entity';
import { CrudService } from '@nestjs-library/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LetterCrudService extends CrudService<Letter> {
  constructor(
    @InjectRepository(Letter)
    letterOrm: Repository<Letter>
  ) {
    super(letterOrm);
  }
}
