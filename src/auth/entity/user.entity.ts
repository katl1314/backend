import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogModel } from '../../blog/entity/blog.entity';

export enum ProviderEnum {
  'google', // 구글
  'github', // 깃헙
  'email', // 이메일
}

/**
  id number NOT NULL,
  username text NOT NULL CHECK (char_length(username) >= 3),
  avatar_url text,
  is_use boolean NOT NULL DEFAULT true,
  userId text NOT NULL UNIQUE,

  description text,
  auth_cd text,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id, userId),
  CONSTRAINT profiles_auth_cd_fkey FOREIGN KEY (auth_cd) REFERENCES public.authority(auth_cd),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
 */
@Entity()
export class UserModel {
  // 사용자 고유 식별자
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 이메일
  @Column({ nullable: false, unique: true })
  email: string;

  // 프로필 이름
  @Column({ nullable: true, unique: true, length: 20 })
  name: string;

  @Column({ nullable: true, unique: true })
  user_id: string;

  // 아바타 이미지
  @Column()
  avatar_url: string;

  // 로그인시 db에 없으면 false로 저장하고, 회원가입이 완료되면 true으로 변환한다.
  @Column('boolean', { default: false })
  is_use: boolean;

  // 한 줄 소개
  @Column({ nullable: true })
  description: string;

  @Column({ enum: ProviderEnum, type: 'enum', default: ProviderEnum.email })
  provider: ProviderEnum;

  @OneToOne(() => BlogModel, (blog) => blog.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id' })
  blog: BlogModel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
