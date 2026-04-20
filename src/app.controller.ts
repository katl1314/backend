import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 루트 컨트롤러.
 *
 * @remarks
 * Base URL: `/`
 *
 * 서버 동작 확인용 기본 엔드포인트를 제공한다.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 헬스체크/동작 확인용 인사말을 반환한다.
   *
   * @returns 인사말 문자열
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
