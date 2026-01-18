import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from '../../auth/entity/user.entity';
import { PostLikeModel } from './post_like.entity';
import { CommentModel } from '../../comment/entity/comment.entity';
import { TagModel } from '../../tag/entity/tag.entity';

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

  // 댓글 목록
  @OneToMany(() => CommentModel, (comment) => comment.post)
  comments: CommentModel[];

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

  @ManyToMany(() => TagModel, (tag) => tag.posts, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagModel[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
