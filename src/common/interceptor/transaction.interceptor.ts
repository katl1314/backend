import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const qr = this.dataSource.createQueryRunner();
    const request = context
      .switchToHttp()
      .getRequest<Request & { qr: QueryRunner }>();

    // 쿼리 러너 연결
    await qr.connect();

    // 쿼리 러너 트랜잭션 시작
    await qr.startTransaction();
    request.qr = qr;

    return next.handle().pipe(
      tap({
        next: () => {
          qr.commitTransaction().then(() => {
            qr.release();
          });
        },
        error: (err) => {
          console.error(err);
        },
      }),
      catchError(async () => {
        // 되돌리기...
        console.error('intercept --- catchError');
        await qr.rollbackTransaction();
        await qr.release();
      }),
    );
  }
}
