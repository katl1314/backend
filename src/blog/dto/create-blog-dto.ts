import { PickType } from '@nestjs/mapped-types';
import { BlogModel } from '../entity/blog.entity';

export class CreateBlogDTO extends PickType(BlogModel, ['user', 'title']) {}
