import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import { Repository } from 'typeorm';
import { BlogService } from '../blog/blog.service';
import { CreateBlogDTO } from '../blog/dto/create-blog-dto';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly authRepo: Repository<UserModel>,
    private readonly blogService: BlogService,
  ) {}

  async getAllUser() {
    return await this.authRepo.find();
  }

  async getUser(userId: string) {
    const user = await this.authRepo.findOne({
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
    const user = await this.authRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  /*
   * 사용자 중복 확인
   */
  async hasUser(email: string) {
    return await this.authRepo.exists({
      where: {
        email,
      },
    });
  }

  /*
   * 사용자 추가
   */
  async postUser(body: CreateUserDto) {
    // 먼저 사용자 엔티티 인스턴스 생성
    const user = this.authRepo.create(body);
    const blog: CreateBlogDTO = {
      user,
      title: `${user.user_id}.log`,
    };
    user.blog = await this.blogService.createBlog(blog); // 블로그 생성...
    return await this.authRepo.save(user);
  }

  async deleteUser(userId: string) {
    return await this.authRepo.delete({ id: userId });
  }

  // 리소스 일부 수정 (부분 업데이트)
  async patchUser() {}
}
