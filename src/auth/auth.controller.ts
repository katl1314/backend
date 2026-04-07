import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { CreateBlogDTO } from '../blog/dto/create-blog-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings-dto';
import { BlogService } from '../blog/blog.service';
import { AuthService } from './auth.service';
import { QueryRunner } from 'typeorm';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
  TokenPayload,
} from './guard/bearer-token.guard';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly blogService: BlogService,
  ) {}

  // 로그인
  @Post('signIn')
  async signIn(@Body() payload: User) {
    const { user_id } = await this.authService.getUserByEmail(payload.email!);
    const { accessToken, refreshToken } = await this.authService.signIn({
      ...payload,
      userId: user_id,
    });
    return {
      accessToken,
      refreshToken,
      userId: user_id,
    };
  }

  // 이메일/비밀번호 로그인
  @Post('signIn/credentials')
  async signInWithCredentials(
    @Body() body: { email: string; password: string },
  ) {
    const user = await this.authService.signInWithCredentials(
      body.email,
      body.password,
    );
    const { accessToken, refreshToken } = await this.authService.signIn({
      email: user.email,
      name: user.user_name,
      image: user.avatar_url,
      userId: user.user_id,
    });
    return { accessToken, refreshToken, userId: user.user_id };
  }

  // access token 갱신
  @Post('access')
  @UseGuards(RefreshTokenGuard)
  async rotateAccessToken(@Req() req: Request & { tokenInfo: TokenPayload }) {
    return await this.authService.rotateToken(req);
  }

  @Get('users')
  getAllUser() {
    return this.authService.getAllUser();
  }

  @Get('users/:userId')
  getUser(@Param('userId') userId: string) {
    return this.authService.getUser(userId);
  }

  @Get('users/:email/exists')
  hasUserByEmail(@Param('email') email: string) {
    return this.authService.hasUser(email);
  }

  @Get('users/email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.authService.getUserByEmail(email);
  }

  // 프로필 업데이트 (user_name, avatar_url, description, socials)
  @Patch('users/:userId')
  @UseGuards(AccessTokenGuard)
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(userId, dto);
  }

  // 앱 설정 조회
  @Get('users/:userId/settings')
  @UseGuards(AccessTokenGuard)
  getSettings(@Param('userId') userId: string) {
    return this.authService.getSettings(userId);
  }

  // 앱 설정 업데이트 (theme, notifications, extra)
  @Patch('users/:userId/settings')
  @UseGuards(AccessTokenGuard)
  updateSettings(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.authService.updateSettings(userId, dto);
  }

  // 회원 탈퇴 (status → WITHDRAWN)
  @Delete('users/:userId')
  @UseGuards(AccessTokenGuard)
  withdrawUser(@Param('userId') userId: string) {
    return this.authService.withdrawUser(userId);
  }

  @Post('users')
  @UseInterceptors(TransactionInterceptor)
  async postUser(
    @Body() body: { user: CreateUserDto; blog: CreateBlogDTO },
    @Req() req: Request & { qr: QueryRunner },
  ) {
    const user = await this.authService.createUser(body.user, req.qr);
    body.blog.user = user;
    const blog = await this.blogService.createBlog(body.blog, req.qr);
    return { user, blog };
  }
}
