import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDTO } from '../blog/dto/create-blog-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from './entity/user.entity';
import { isEmpty } from '../common/util/util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly authRepository: Repository<UserModel>,
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

  /*
   * 사용자 중복 확인
   */
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

  async deleteUser(userId: string) {
    return await this.authRepository.delete({ id: userId });
  }
}
