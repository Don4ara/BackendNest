import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash } from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  private readonly JWT_SECRET:string;
  private readonly JWT_ACCESS_TOKEN_EXPIRES_IN:string;
  private readonly JWT_REFRESH_TOKEN_EXPIRES_IN:string;

  constructor(private readonly PrismaService: PrismaService, private readonly configService: ConfigService) {
    this.JWT_SECRET = configService.getOrThrow('JWT_SECRET');
    this.JWT_ACCESS_TOKEN_EXPIRES_IN = configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRES_IN');
    this.JWT_REFRESH_TOKEN_EXPIRES_IN = configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES_IN');
  }

  async register(dto: RegisterRequest) {
    const { name, email, password } = dto;

    const existingUser = await this.PrismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }


    const user = await this.PrismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password),
      },
    });
    return user;
  }
}