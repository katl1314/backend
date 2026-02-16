import {
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { QueryRunner } from 'typeorm';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 댓글 등록
  @Post(':commentId')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AccessTokenGuard)
  postComment(
    @Param('commentId') commentId: string,
    @Req() req: Request & { qr?: QueryRunner },
  ) {
    console.log('postComment >> ', commentId, req);
  }
}
