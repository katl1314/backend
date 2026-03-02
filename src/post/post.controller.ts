import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
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
    @Req() req: Request & { qr: QueryRunner; user: { user_id: string } },
    @Body() post: CreatePostDto & { tags: string[] },
  ) {
    try {
      const newPost = { ...post, user_id: req.user.user_id };
      return this.postService.create(newPost, req.qr);
    } catch {
      throw new BadRequestException('이미 존재하는 포스트입니다.');
    }
  }

  @Get()
  getPosts(@Query('cursor', ParseIntPipe) cursor: number) {
    return this.postService.getPosts({ cursor, take: 10 });
  }

  @Get(':userId/:path')
  getPost(@Param('userId') userId: string, @Param('path') path: string) {
    return this.postService.getPost(userId, path);
  }

  @Post('/like/:postId')
  @UseGuards(AccessTokenGuard)
  createLike(
    @Req() req: Request & { qr: QueryRunner; user: { user_id: string } },
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    console.log('createLike ------', req, postId);
    return { status: 'ok' };
  }
}
