import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Rest API 설정
  app.setGlobalPrefix('api');
  app.enableCors();

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('T와 F와의 거리 서버 API 문서')
    .setDescription('[나 T 나?? 팀] T와 F와의 거리 API Swagger 문서입니다.')
    .setVersion('1.0')
    .addTag('mock')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      // 목서버 활성화를 위한 옵션
      tryItOutEnabled: true, // Swagger UI에서 API를 직접 호출할 수 있도록 활성화
      requestInterceptor: (request: { headers: Record<string, string> }) => {
        request.headers['x-requested-with'] = 'swagger-ui'; // Swagger UI에서 요청을 보낼 때 필요한 헤더 설정'
        return request;
      },
    },
  });

  await app.listen(3000);
  console.log(`🤡 Mock Server running on: http://localhost:3000/api-docs`);
  console.log(
    `Swagger UI에서 'try it out' 버튼을 클릭하여 API를 테스트할 수 있습니다.`,
  );
}
bootstrap();
