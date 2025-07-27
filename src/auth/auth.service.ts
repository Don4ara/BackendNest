import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';
import type { Response, Request } from 'express';
import { isDev } from '../utils/is-dev.utils';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  private readonly JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  private  readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = this.configService.getOrThrow<string>('JWT_SECRET');
    this.JWT_ACCESS_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');
    this.JWT_REFRESH_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRES_IN');
    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async register(res:Response , dto: RegisterRequest) {
    const { name, email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await hash(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return this.auth(res, user.id);
  }
  async refresh(req: Request, res: Response) {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new NotFoundException('Токен обновления не найден');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);
    if (!payload) {
      throw new NotFoundException('Неверный токен обновления');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select:{
        id: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.auth(res, user.id)

  }
  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));
  }


  private auth(res: Response, id: string) {
    const {accessToken, refreshToken } = this.generateTokens(id);
    const expiresMs = this.parseExpiresIn(this.JWT_REFRESH_TOKEN_EXPIRES_IN);
    const expires = new Date(Date.now() + expiresMs);
    this.setCookie(res, refreshToken, expires);

    return {accessToken}
  }
  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid expiresIn format');

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return amount * 1000;
      case 'm': return amount * 60 * 1000;
      case 'h': return amount * 60 * 60 * 1000;
      case 'd': return amount * 24 * 60 * 60 * 1000;
      default: throw new Error('Unsupported time unit');
    }
  }


  async login(res: Response ,dto: LoginRequest){
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.auth(res, user.id)
  }

  private generateTokens(id: string): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {id};

    const accessToken = this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }
  
  private setCookie(res: Response, value: string, expires: Date){
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}