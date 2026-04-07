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

  async findOrCreateMany(
    tagNames: string[],
    qr?: QueryRunner,
  ): Promise<TagModel[]> {
    const repo = this.getRepository(qr);
    const tags: TagModel[] = [];

    for (const name of tagNames) {
      let tag = await repo.findOne({ where: { name } });
      if (!tag) {
        tag = repo.create({ name });
        await repo.save(tag);
      }
      tags.push(tag);
    }

    return tags;
  }
}
