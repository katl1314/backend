import { Body, Controller, Post } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDTO } from './dto/create-blog-dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  postBlog(@Body() blog: CreateBlogDTO) {
    console.log('blog :::::', blog);
    return this.blogService.createBlog(blog);
  }
}
