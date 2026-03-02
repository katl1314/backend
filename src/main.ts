import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception-filter/http.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true, // 쿠키 허용 필수
    origin: 'http://localhost:3000', // 클라이언트 주소
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  // app.setGlobalPrefix('v1');
  await app.listen(3001);
}
bootstrap();
