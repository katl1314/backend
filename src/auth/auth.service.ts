import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthModel } from './entity/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthModel)
    private readonly authRepo: Repository<AuthModel>,
  ) {}

  async getAllUser() {
    return await this.authRepo.find();
  }

  async getUser(userId: string) {
    const user = await this.authRepo.findOne({
      where: {
        user_id: userId,
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

  async hasUser(email: string) {
    return await this.authRepo.exists({
      where: {
        email,
      },
    });
  }

  async postUser(body: any) {
    const newUser = this.authRepo.create(body);
    return await this.authRepo.save(newUser);
  }

  async deleteUser(userId: string) {
    return await this.authRepo.delete({ id: userId });
  }

  // 리소스 일부 수정 (부분 업데이트)
  async patchUser() {}
}
