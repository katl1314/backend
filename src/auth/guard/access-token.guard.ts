import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

interface IRequest {
  [key: string]: unknown;
  headers: { [key: string]: string };
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const req = context.switchToHttp().getRequest<IRequest>();
      const rawToken = req.headers['authorization'];
      const token = this.authService.extractTokenFromHeader(rawToken, true); // 토큰을 가져온다.

      this.authService.verifyToken(token);

      return true;
    } catch {
      return false;
    }
  }
}
