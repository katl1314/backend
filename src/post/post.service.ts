import { CommonService, PaginateProps } from '../common/common.service';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, QueryRunner, Repository } from 'typeorm';
import { PostModel } from './entity/post.entity';
import { isEmpty } from '../common/util/util';
import { Injectable } from '@nestjs/common';
import { PostLikeModel } from './entity/post_like.entity';
import { UserModel } from '../auth/entity/user.entity';

interface PostPaginateProps extends PaginateProps {
  userId?: string;
}

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(PostLikeModel)
    private readonly postLikeRepository: Repository<PostLikeModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return isEmpty(qr)
      ? this.postRepository
      : qr.manager.getRepository(PostModel);
  }

  /*
   * @name create
   * @version 1.0
   * @description 포스트를 등록하는 함수
   * @params {CreatePostDto | Y} post 등록할 포스트 객체
   * @params {QueryRunner | N} qr 트랜잭션을 위한 쿼리러너 객체
   * @returns
   * */
  async create(post: CreatePostDto & { user_id: string }, qr?: QueryRunner) {
    const repo = this.getRepository(qr);
    console.log(post.visibility);
    post.status = 'publish'; // TODO required column 개선 필요
    const newPost = repo.create(post);
    return await repo.save(newPost);
  }

  /*
   * @name getPosts
   * @version 1.0
   * @description 포스트 리스트를 가져오는 함수
   * @params {PaginateDto | Y} dto 페이징을 위한 객체
   * @Params {Number | Y} dto.cursor 커서
   * @Params {Number | N} dto.take 조회할 개수
   * @returns
   * */
  async getPosts(dto: PostPaginateProps) {
    // dto내 user_id가 있으면 조건문을 전달한다.
    const where = dto.userId ? { user_id: Equal(dto.userId) } : {};
    const relations = { comments: true, likes: true };
    return await this.commonService.paginate(
      dto,
      this.postRepository,
      where,
      relations,
    );
  }

  /*
   * @name getPost
   * @version 1.0
   * @description 포스트 조회하는 함수
   * @Params {string | Y} userId 사용자 ID
   * @Params {string | N} postId 포스트 ID
   * @returns
   * */
  async getPost(userId: string, postId: string) {
    const result = await this.postRepository.findOne({
      relations: {
        user: {
          blog: true,
        },
        tags: true,
        likes: true,
        comments: true,
      },
      where: {
        user_id: Equal(userId),
        path: Equal(`/${postId}`),
      },
    });

    if (!result) return { status: '404', message: '찾을 수 없습니다.' };

    return result;
  }

  /*
   * @name getLike
   * @version 1.0
   * @description 특정 포스트에 유저가 좋아요를 눌렀는지 조회하는 함수
   * @Params {number | Y} postId 포스트 ID
   * @Params {string | Y} userId 사용자 ID
   * @returns { isLiked: boolean }
   * */
  async getLike(postId: number, userId: string) {
    try {
      //console.log('getLike --- service', postId, userId);
      const like = await this.postLikeRepository.exists({
        where: {
          post_id: Equal(postId),
          user_id: Equal(userId),
        },
      });

      //console.log('ok', like);
      return { isLiked: !!like };
    } catch {
      //console.log('err', err);
      return { isLike: false };
    }
  }

  /*
   * @name like
   * @version 1.0
   * @description 포스트 좋아요 눌렀을때 함수
   * @Params {string | Y} userId 사용자 ID
   * @Params {string | Y} postId 포스트 ID
   * @Params {string | Y} 좋아요인지
   * @returns
   * */
  async doLike(user: UserModel, postId: number, isLike: boolean) {
    // 포스트를 먼저 찾아야한다.
    const post = await this.postRepository.findOne({
      where: {
        id: Equal(postId),
      },
    });

    if (isEmpty(post)) {
      throw new Error('Not Found');
    }

    if (isLike) {
      const like = this.postLikeRepository.create({
        post: post,
        user: user,
      });

      // 실제 데이터베이스에 저장해야한다.
      await this.postLikeRepository.save(like);

      return like;
    } else {
      // 삭제해야함.
      return await this.postLikeRepository.delete({
        post_id: postId,
        user_id: user.id,
      });
    }
  }
}
