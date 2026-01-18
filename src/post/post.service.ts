import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PostModel } from './entity/post.entity';
import { isEmpty } from '../common/util/util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return isEmpty(qr)
      ? this.postRepository
      : qr.manager.getRepository(PostModel);
  }

  createPost(post: CreatePostDto, qr?: QueryRunner) {
    const repo = this.getRepository(qr);
    return repo.create(post);
  }
}
