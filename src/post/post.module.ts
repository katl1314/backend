import { TagModel } from '../tag/entity/tag.entity';
import { PostController } from './post.controller';
import { PostModel } from './entity/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from '../tag/tag.module';
import { PostService } from './post.service';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostModel, TagModel]),
    AuthModule,
    TagModule,
    CommonModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
