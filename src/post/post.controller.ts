import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../auth/guard/access-token.guard';
import { PostService } from './post.service';
import { QueryRunner } from 'typeorm';
import { TagService } from '../tag/tag.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly tagService: TagService,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  createPost(
    @Req() req: Request & { qr: QueryRunner },
    @Body() post: CreatePostDto & { tags: string[] },
  ) {
    const { ...others } = post;
    return this.postService.createPost(others, req.qr);
  }
}
