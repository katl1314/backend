import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModel } from './entity/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthModel])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
