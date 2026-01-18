import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostModel } from '../../post/entity/post.entity';

@Entity()
export class TagModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => PostModel, (post) => post.tags)
  posts: PostModel[];
}
