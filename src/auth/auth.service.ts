import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from './entity/user.entity';
import { isEmpty } from '../common/util/util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly authRepository: Repository<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return isEmpty(qr)
      ? this.authRepository
      : qr.manager.getRepository<UserModel>(UserModel);
  }

  async getAllUser() {
    return await this.authRepository.find();
  }

  async getUser(userId: string) {
    const user = await this.authRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: {
        blog: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.authRepository.findOne({
      where: {
        email,
      },
      relations: {
        blog: true,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async hasUser(email: string) {
    return await this.authRepository.exists({
      where: {
        email,
      },
    });
  }

  async createUser(user: CreateUserDto, qr?: QueryRunner) {
    // 먼저 사용자 엔티티 인스턴스 생성
    const authRepo = this.getRepository(qr);
    const newUser = authRepo.create(user);
    await authRepo.save(newUser);
    return newUser;
  }

  // 토큰 추출
  extractTokenFromHeader(token: string, isBearer: boolean = false) {
    const splitToken = token.split(' '); // 토큰을 공백 기준으로 나눈다.
    const prefix = isBearer ? 'Bearer' : 'Basic';
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return splitToken[1];
  }

  // 토큰 검증
  verifyToken(token: string): unknown {
    try {
      return this.jwtService.verify(token, {
        secret: 'secret_key', // TODO .env에 추가할것.
      });
    } catch {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }

  // 로그인
  async signIn(payload) {
    const accessToken = await this.signToken(payload);
    const refreshToken = await this.signToken(payload, true);
    return { accessToken, refreshToken };
  }

  // Access Token, Refresh Token 발급
  async signToken(payload, isRefreshToken: boolean = false) {
    return await this.jwtService.signAsync(
      {
        ...payload,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: 'secret_key',
        expiresIn: isRefreshToken ? 60 * 60 * 24 * 30 : 60 * 24 * 24,
      },
    );
  }

  async rotateToken(token: string, isRefresh: boolean = false) {
    await new Promise((resolve) => resolve(1));
    console.log(token, isRefresh);
  }
}
