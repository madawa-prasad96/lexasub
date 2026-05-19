import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(config.get('GOOGLE_CLIENT_ID'));
  }

  private buildUserProfile(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      experienceLevel: user.experienceLevel,
      targetLanguage: {
        code: user.targetLangCode,
        label: user.targetLangLabel,
        nativeLabel: user.targetLangNative,
      },
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      this.logger.warn(`Register failed: email already exists [${dto.email}]`);
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    this.logger.log(`User registered: ${user.email} (${user.id})`);
    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.buildUserProfile(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) {
      this.logger.warn(`Login failed: user not found [${dto.email}]`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      this.logger.warn(`Login failed: wrong password [${dto.email}]`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.email} (${user.id})`);
    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.buildUserProfile(user), ...tokens };
  }

  async googleAuth(idToken: string) {
    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (err) {
      this.logger.warn(`Google token verification failed: ${err.message}`);
      throw new BadRequestException('Invalid Google token');
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        this.logger.log(`Google auth: linked Google account to existing user ${email}`);
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture },
        });
      } else {
        this.logger.log(`Google auth: created new user ${email}`);
        user = await this.prisma.user.create({
          data: { email, name, googleId, avatar: picture },
        });
      }
    } else {
      this.logger.log(`Google auth: existing user signed in ${email}`);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.buildUserProfile(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      this.logger.warn('Refresh failed: token not found or expired');
      throw new UnauthorizedException('Refresh token expired');
    }

    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      this.logger.warn(`Refresh failed: invalid token signature — ${err.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      this.logger.warn(`Refresh failed: user not found (${payload.sub})`);
      throw new UnauthorizedException();
    }

    this.logger.log(`Access token refreshed for user ${user.email}`);
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') },
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    this.logger.log('User logged out, refresh token revoked');
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`getMe failed: user not found (${userId})`);
      throw new UnauthorizedException();
    }
    return this.buildUserProfile(user);
  }
}
