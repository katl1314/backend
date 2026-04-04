import { PartialType, PickType } from '@nestjs/mapped-types';
import { UserModel } from '../entity/user.entity';

export class UpdateUserDto extends PartialType(
  PickType(UserModel, [
    'user_name',
    'avatar_url',
    'description',
    'socials',
  ] as const),
) {}
