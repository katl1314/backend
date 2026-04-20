import { Controller } from '@nestjs/common';
import { CommonService } from './common.service';

/**
 * 공통 유틸 API 컨트롤러.
 *
 * @remarks
 * Base URL: `/common`
 *
 * 커서 페이지네이션, 트랜잭션 인터셉터, 예외 필터 등 공통 기능은
 * 서비스/인터셉터 레벨에서 사용되며 외부 엔드포인트는 두지 않는다.
 *
 * @todo 공통 기능이 API 경계로 확장되면 엔드포인트 정의
 */
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
}
