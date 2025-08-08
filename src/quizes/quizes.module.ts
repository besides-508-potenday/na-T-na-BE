import { Module } from '@nestjs/common';
import { QuizesService } from './domain/quizes.service';
import { QuizRepositoryImpl } from './infrastructure/quiz.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QuizCacheStoreImpl } from './infrastructure/quiz.cache-store';

@Module({
  imports: [],
  providers: [
    QuizesService,
    {
      provide: 'IQuizRepository',
      useFactory: (prismaService: PrismaService) => {
        return new QuizRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: 'IQuizCacheStore',
      useFactory: (redisService: RedisService) => {
        return new QuizCacheStoreImpl(redisService);
      },
      inject: [RedisService],
    },
  ],
  exports: [QuizesService],
})
export class QuizesModule {}
