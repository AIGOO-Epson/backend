import { Injectable } from '@nestjs/common';
import { Follow } from '../repository/entity/follow.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    public readonly followOrm: Repository<Follow>
  ) {}
}
