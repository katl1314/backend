import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from '../../auth/entity/user.entity';
import { PostLikeModel } from './post_like.entity';

@Entity()
@Unique(['user_id', 'path'])
export class PostModel {
  // 게시글 식별자
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  // 작성자
  @ManyToOne(() => UserModel, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  // 좋아요...
  @OneToMany(() => PostLikeModel, (like) => like.post)
  likes: PostLikeModel[];

  @Column()
  path: string;

  @Column({ type: 'varchar', length: 40 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  summary: string;

  @Column()
  thumbnail: string;

  @Column()
  status: string; // enum

  @Column({ type: 'boolean', default: true })
  visibility: boolean; // true이면 보여준다.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
