import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.authService.getUser(id);
  }

  @Get('users/:email/exists')
  hasUserByEmail(@Param('email') email: string) {
    return this.authService.hasUser(email);
  }

  @Get('users/email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.authService.getUserByEmail(email);
  }

  @Patch('users/email/:email')
  patchUserByEmail(@Param('email') email: string, @Body() user: any) {
    console.log(email, user);
  }

  @Post('users')
  postUser(@Body() body: any) {
    return this.authService.postUser(body);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
