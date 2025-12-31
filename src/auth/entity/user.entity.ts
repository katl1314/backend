import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogModel } from '../../blog/entity/blog.entity';
import { PostModel } from '../../post/entity/post.entity';
import { PostLikeModel } from '../../post/entity/post_like.entity';

export enum ProviderEnum {
  google = 'GOOGLE', // 구글
  github = 'GITHUB', // 깃헙
  email = 'EMAIL', // 이메일
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE', // 활성
  WITHDRAWN = 'WITHDRAWN', // 탈퇴
  BLOCKED = 'BLOCKED', // 차단
}

@Entity()
export class UserModel {
  // 사용자 고유 식별자
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 이메일
  @Column({ nullable: false, unique: true })
  email: string;

  // 로그인 아이디
  @Column({ unique: true, length: 20 })
  user_id: string;

  // 프로필 이름
  @Column({ unique: true, length: 20 })
  user_name: string;

  // 프로필 이미지
  @Column()
  avatar_url: string;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.ACTIVE })
  status: StatusEnum;

  @Column({ enum: ProviderEnum, type: 'enum', default: ProviderEnum.email })
  provider: ProviderEnum;

  @OneToOne(() => BlogModel, (blog) => blog.user, { onDelete: 'CASCADE' })
  blog: BlogModel;

  @OneToMany(() => PostModel, (post) => post.user)
  posts: PostModel[];

  @OneToMany(() => PostLikeModel, (like) => like.user)
  likes: PostLikeModel[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
