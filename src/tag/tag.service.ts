import { InjectRepository } from '@nestjs/typeorm';
import { TagModel } from './entity/tag.entity';
import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { isEmpty } from '../common/util/util';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return isEmpty(qr)
      ? this.tagRepository
      : qr.manager.getRepository(TagModel);
  }

  createTag(tag: any) {
    console.log(tag);
  }
}
