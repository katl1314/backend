import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BlogModel } from './entity/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogDTO } from './dto/create-blog-dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogModel)
    private readonly blogRepo: Repository<BlogModel>,
  ) {}

  async createBlog(dto: CreateBlogDTO) {
    const newBlog = this.blogRepo.create(dto);
    return await this.blogRepo.save(newBlog);
  }
}
