import { CreateBlogDTO } from './dto/create-blog-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { BlogModel } from './entity/blog.entity';
import { isEmpty } from '../common/util/util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogModel)
    private readonly blogRepository: Repository<BlogModel>,
  ) {}

  getRepository(qr?: QueryRunner): Repository<BlogModel> {
    return isEmpty(qr)
      ? this.blogRepository
      : qr.manager.getRepository<BlogModel>(BlogModel);
  }

  async createBlog(dto: CreateBlogDTO, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const newBlog = repository.create(dto);
    return await repository.save(newBlog);
  }
}
