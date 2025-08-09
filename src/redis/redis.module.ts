import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as ioRedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    ioRedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, // Redis 서버 URL
      options: {
        host: process.env.REDIS_HOST, // Redis 호스트
        port: 6379, // Redis 포트
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
