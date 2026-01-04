import { UserModel } from '../entity/user.entity';
import { PickType } from '@nestjs/mapped-types';

export class CreateUserDto extends PickType(UserModel, [
  'avatar_url',
  'provider',
  'user_id',
  'email',
]) {}
