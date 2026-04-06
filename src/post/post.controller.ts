import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
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
import {
  AccessTokenGuard,
  OptionalAccessTokenGuard,
} from '../auth/guard/bearer-token.guard';
import { PostService } from './post.service';
import { QueryFailedError, QueryRunner } from 'typeorm';
import { TagService } from '../tag/tag.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UserModel } from '../auth/entity/user.entity';
import { DB_ERROR_CODE } from '../common/const/db-error-code.const';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly tagService: TagService,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @Req() req: Request & { qr: QueryRunner; user: { user_id: string } },
    @Body() post: CreatePostDto & { tags: string[] },
  ) {
    try {
      const newPost = { ...post, user_id: req.user.user_id };
      return await this.postService.create(newPost, req.qr);
    } catch (e: unknown) {
      if (
        e instanceof QueryFailedError &&
        (e.driverError as { code?: string }).code ===
          DB_ERROR_CODE.UNIQUE_VIOLATION
      ) {
        throw new ConflictException('이미 동일한 URL의 포스트가 존재합니다.');
      }
      throw new BadRequestException('포스트 등록 중 오류가 발생하였습니다.');
    }
  }

  @Get()
  @UseGuards(OptionalAccessTokenGuard)
  getPosts(
    @Query('cursor', ParseIntPipe) cursor: number,
    @Query('userId') userId: string,
    @Req() req: Request & { user?: UserModel },
  ) {
    return this.postService.getPosts(
      { cursor, userId, take: 10 },
      req.user?.user_id,
    );
  }

  @Get(':userId/:path')
  @UseGuards(OptionalAccessTokenGuard)
  getPost(
    @Param('userId') userId: string,
    @Param('path') path: string,
    @Req() req: Request & { user?: UserModel },
  ) {
    return this.postService.getPost(userId, path, req.user?.user_id);
  }

  // 좋아요 여부 조회
  @Get(':postId/like/me')
  @UseGuards(AccessTokenGuard)
  getLikeById(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: Request & { user: UserModel },
  ) {
    return this.postService.getLike(postId, req.user.id);
  }

  // 좋아요 추가
  @Post(':postId/like')
  @UseGuards(AccessTokenGuard)
  createLike(
    @Req() req: Request & { qr: QueryRunner; user: UserModel },
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.doLike(req.user, postId, true);
  }

  // 좋아요 취소
  @Delete(':postId/like')
  @UseGuards(AccessTokenGuard)
  deleteLike(
    @Req() req: Request & { qr: QueryRunner; user: UserModel },
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.doLike(req.user, postId, false);
  }
}
