import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterRequest {

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(50, { message: 'Имя не может превышать 50 символов' })
  name: string;

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
