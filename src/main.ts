import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Rest API 설정
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
