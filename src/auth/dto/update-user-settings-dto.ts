import { ThemeEnum } from '../entity/user_settings.entity';

export class UpdateUserSettingsDto {
  theme?: ThemeEnum;
  comment_notification?: boolean;
  update_notification?: boolean;
  extra?: Record<string, unknown>;
}
