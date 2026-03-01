import { CommonService, PaginateProps } from '../common/common.service';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, QueryRunner, Repository } from 'typeorm';
import { PostModel } from './entity/post.entity';
import { isEmpty } from '../common/util/util';
import { Injectable } from '@nestjs/common';
import { PostLikeModel } from './entity/post_like.entity';

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
    post.visibility = true; // TODO true or false boolean 개선필요
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
  async getPosts(dto: PaginateProps) {
    return await this.commonService.paginate(dto, this.postRepository);
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
   * @name like
   * @version 1.0
   * @description 포스트 좋아요 눌렀을때 함수
   * @Params {string | Y} userId 사용자 ID
   * @Params {string | N} postId 포스트 ID
   * @returns
   * */
  async post() {}
}
