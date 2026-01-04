import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from '../../auth/entity/user.entity';
import { PostModel } from '../../post/entity/post.entity';

@Entity()
export class CommentModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  content: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'uuid' })
  pid: string;

  // user, post 관계 설정
  @ManyToOne(() => UserModel, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  // user, post 관계 설정
  @ManyToOne(() => PostModel, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostModel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
