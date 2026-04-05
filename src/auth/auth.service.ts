import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ProviderEnum, StatusEnum, UserModel } from './entity/user.entity';
import { UserSettingsModel } from './entity/user_settings.entity';
import { isEmpty } from '../common/util/util';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly authRepository: Repository<UserModel>,
    @InjectRepository(UserSettingsModel)
    private readonly settingsRepository: Repository<UserSettingsModel>,
    private readonly jwtService: JwtService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return isEmpty(qr)
      ? this.authRepository
      : qr.manager.getRepository<UserModel>(UserModel);
  }

  async getAllUser() {
    return await this.authRepository.find({
      relations: {
        posts: true,
        blog: true,
      },
    });
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
    const authRepo = this.getRepository(qr);
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    const newUser = authRepo.create(user);
    await authRepo.save(newUser);
    return newUser;
  }

  async signInWithCredentials(email: string, password: string) {
    const user = await this.authRepository.findOne({
      where: { email, provider: ProviderEnum.email },
      select: ['id', 'email', 'user_id', 'user_name', 'avatar_url', 'password'],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return user;
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
        secret: process.env.AUTH_SECRET,
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
        secret: process.env.AUTH_SECRET,
        expiresIn: isRefreshToken ? 60 * 60 * 24 * 30 : 60 * 24 * 24,
      },
    );
  }

  async rotateToken(token: string, isRefresh: boolean = false) {
    await new Promise((resolve) => resolve(1));
    console.log(token, isRefresh);
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.authRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException();
    Object.assign(user, dto);
    return await this.authRepository.save(user);
  }

  async getSettings(userId: string) {
    const user = await this.authRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException();

    const settings = await this.settingsRepository.findOne({
      where: { user: { id: user.id } },
    });

    return (
      settings ?? {
        theme: 'SYSTEM',
        comment_notification: true,
        update_notification: true,
      }
    );
  }

  async updateSettings(userId: string, dto: UpdateUserSettingsDto) {
    const user = await this.authRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException();

    let settings = await this.settingsRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ user, ...dto });
    } else {
      Object.assign(settings, dto);
    }

    return await this.settingsRepository.save(settings);
  }

  async withdrawUser(userId: string) {
    const user = await this.authRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException();
    user.status = StatusEnum.withdrawn;
    return await this.authRepository.save(user);
  }
}
