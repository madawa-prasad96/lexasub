import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsOptional, IsString } from 'class-validator';

class UpdatePreferencesDto {
  @IsOptional() @IsString() experienceLevel?: string;
  @IsOptional() @IsString() targetLangCode?: string;
  @IsOptional() @IsString() targetLangLabel?: string;
  @IsOptional() @IsString() targetLangNative?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('me/preferences')
  updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.id, dto);
  }
}
