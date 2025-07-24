import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequest{
  @IsString({ message: 'Почта должно быть строкой' })
  @IsNotEmpty({ message: 'Почта не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат почты' })
  email: string;


  @IsString({ message: 'Пароль должно быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(128, { message: 'Пароль не может превышать 50 символов' })
  password: string;
}