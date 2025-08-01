import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerMockInterceptor } from './common/swagger-mock.interceptor';
import { SwaggerMockApiService } from './common/swagger-mock-api.service';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    AuthModule,
    PrismaModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SwaggerMockInterceptor, // Swagger Mock 인터셉터
    SwaggerMockApiService, // Swagger UI 에서만 사용되는  Mock API 서비스
  ],
})
export class AppModule {}
