import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  Repository,
  FindOptionsWhere,
  LessThanOrEqual,
} from 'typeorm';
import { PostModel } from '../post/entity/post.entity';

export interface PaginateProps {
  cursor: number;
  take: number;
}

@Injectable()
export class CommonService {
  paginate(
    dto: PaginateProps,
    repository: Repository<PostModel>,
    where: FindOptionsWhere<PostModel> = {},
  ) {
    // 커서 기반
    return this.cursorPaginate(dto, repository, where);
  }

  private async cursorPaginate(
    dto: PaginateProps,
    repository: Repository<PostModel>,
    where: FindOptionsWhere<PostModel> = {},
  ) {
    // 1. Where 조건 동적 생성

    if (dto.cursor && dto.cursor > 0) {
      where.id = LessThanOrEqual(dto.cursor);
    }

    const options: FindManyOptions<PostModel> = {
      relations: {
        user: {
          blog: true,
        },
        tags: true,
      },
      take: dto.take + 1,
      order: {
        id: 'DESC', // 최신순
      },
      where,
    };

    const posts = await repository.find(options);

    const hasNext = posts.length > dto.take; // 다음 아이템 여부
    const data = posts.slice(0, dto.take);

    // 마지막 아이템의 ID를 다음 커서로 지정
    const lastItem = data.length > 0 ? data[data.length - 1] : null;

    return {
      data,
      hasNext,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: data.length,
    };
  }
}
