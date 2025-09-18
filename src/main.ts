import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin','*'],
    exposedHeaders: '*',
  });


  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();