import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  private readonly JWT_REFRESH_TOKEN_EXPIRES_IN: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = this.configService.getOrThrow<string>('JWT_SECRET');
    this.JWT_ACCESS_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');
    this.JWT_REFRESH_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRES_IN');
  }

  async register(dto: RegisterRequest) {
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

    return this.generateTokens(user.id);
  }


  async login(dto: LoginRequest){
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

    return this.generateTokens(user.id);
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
}