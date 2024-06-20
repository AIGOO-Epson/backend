import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistInfo } from './entity/artist-info.entity';

@Injectable()
export class ArtistRepository {
  constructor(
    @InjectRepository(ArtistInfo)
    public readonly artistInfoOrm: Repository<ArtistInfo>
  ) {}
}
