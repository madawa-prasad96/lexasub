import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdatePreferencesDto {
  experienceLevel?: string;
  targetLangCode?: string;
  targetLangLabel?: string;
  targetLangNative?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      experienceLevel: user.experienceLevel,
      targetLanguage: {
        code: user.targetLangCode,
        label: user.targetLangLabel,
        nativeLabel: user.targetLangNative,
      },
      createdAt: user.createdAt.toISOString(),
    };
  }
}
