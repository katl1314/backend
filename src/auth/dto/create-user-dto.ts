import { PickType } from '@nestjs/mapped-types';
import { UserModel } from '../entity/user.entity';

export class CreateUserDto extends PickType(UserModel, [
  'avatar_url',
  'description',
  'provider',
  'user_id',
  'email',
  'name',
]) {}
