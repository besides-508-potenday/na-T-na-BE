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
import { ChatbotsModule } from './chatbots/chatbots.module';
import { MessagesModule } from './messages/messages.module';
import { QuizesModule } from './quizes/quizes.module';
import { ChatroomsModule } from './chatrooms/chatrooms.module';
import { RedisService } from './redis/redis.service';
import { ExternalApiModule } from './external-api/external-api.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    AuthModule,
    PrismaModule,
    TerminusModule,
    ChatbotsModule,
    MessagesModule,
    QuizesModule,
    ChatroomsModule,
    ExternalApiModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SwaggerMockInterceptor, // Swagger Mock 인터셉터
    SwaggerMockApiService,
    RedisService,
    // Swagger UI 에서만 사용되는  Mock API 서비스
  ],
})
export class AppModule {}
