import { Controller } from '@nestjs/common';
import { BlogService } from './blog.service';

/**
 * 블로그 API 컨트롤러.
 *
 * @remarks
 * Base URL: `/blog`
 *
 * 블로그 생성은 `AuthController.postUser`에서 회원가입과 동일 트랜잭션으로
 * 처리하므로, 별도 엔드포인트를 아직 노출하지 않는다.
 *
 * @todo 블로그 조회/수정 등 독립 엔드포인트 추가
 */
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
}
