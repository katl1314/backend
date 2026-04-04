export class UpdateUserDto {
  user_name?: string;
  avatar_url?: string;
  description?: string;
  socials?: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
}
