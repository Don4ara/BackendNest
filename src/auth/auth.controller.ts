import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type {Response, Request} from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { GetUser } from '../decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Res({passthrough:true}) res: Response, @Body() dto: RegisterRequest) {
    return await this.authService.register(res, dto);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({passthrough:true}) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res,dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request ,@Res({passthrough:true}) res: Response) {
    return await this.authService.refresh(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({passthrough:true}) res: Response) {
    return await this.authService.logout(res);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

}
