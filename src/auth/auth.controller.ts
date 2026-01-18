import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { CreateBlogDTO } from '../blog/dto/create-blog-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { BlogService } from '../blog/blog.service';
import { AuthService } from './auth.service';
import { QueryRunner } from 'typeorm';

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

  @Post('signIn')
  async signIn(@Body() payload: User) {
    const { user_id } = await this.authService.getUserByEmail(payload.email!);
    const { accessToken, refreshToken } = await this.authService.sign(payload);
    return {
      accessToken,
      refreshToken,
      userId: user_id,
    };
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
