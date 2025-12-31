import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from '../../auth/entity/user.entity';

@Entity()
@Index(['url_slug'])
export class BlogModel {
  // 식별자
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 블로그 소유자
  @OneToOne(() => UserModel, (user) => user.blog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  // 블로그 주소 식별자(인덱스)
  @Column()
  url_slug: string;

  // 블로그 제목
  @Column({ type: 'varchar', length: 40 })
  title: string;

  // 블로그 소개
  @Column({ type: 'varchar', length: 100 })
  description: string;

  // 생성일
  @CreateDateColumn()
  created_at: Date;

  // 수정일
  @UpdateDateColumn()
  updated_at: Date;
}
