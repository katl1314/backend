import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch() // 모든 예외를 잡으려면 비워두고, 특정 예외만 잡으려면 @Catch(HttpException) 처럼 명시합니다.
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 예외가 HttpException인지 확인하여 상태 코드 결정
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 예외 메시지 추출
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 클라이언트에 보낼 표준 응답 구조
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error:
        typeof message === 'string'
          ? message
          : (message as Error)?.message || message,
    });
  }
}
