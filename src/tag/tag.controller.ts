import { Controller } from '@nestjs/common';
import { TagService } from './tag.service';

/**
 * 태그 API 컨트롤러.
 *
 * @remarks
 * Base URL: `/tag`
 *
 * 현재 노출되는 엔드포인트는 없다. 태그 CRUD는 `PostController.createPost`에서
 * `TagService.findOrCreateMany`로 간접 수행되며, 독립 API가 필요한 시점까지
 * 비워둔다.
 *
 * @todo 태그 목록/검색/삭제 등 독립 엔드포인트 추가
 */
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}
}
