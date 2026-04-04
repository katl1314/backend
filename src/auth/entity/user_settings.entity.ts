import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from './user.entity';

export enum ThemeEnum {
  light = 'LIGHT',
  dark = 'DARK',
  system = 'SYSTEM',
}

@Entity('user_settings')
export class UserSettingsModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserModel;

  @Column({ type: 'enum', enum: ThemeEnum, default: ThemeEnum.system })
  theme: ThemeEnum;

  @Column({ default: true })
  comment_notification: boolean;

  @Column({ default: true })
  update_notification: boolean;

  // 알려지지 않은 미래 설정을 위한 확장 포인트
  @Column({ type: 'jsonb', default: {} })
  extra: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
