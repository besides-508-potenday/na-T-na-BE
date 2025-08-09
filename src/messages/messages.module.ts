import { Module } from '@nestjs/common';
import { MessagesService } from './domain/messages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { MessageRepositoryImpl } from './infrastructure/message.repository';
import { MessageCacheStoreImpl } from './infrastructure/message.cache-store';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    MessagesService,
    {
      provide: 'IMessageRepository',
      useFactory: (prismaService: PrismaService) => {
        return new MessageRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: 'IMessageCacheStore',
      useFactory: (redisService: RedisService) => {
        return new MessageCacheStoreImpl(redisService);
      },
      inject: [RedisService],
    },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
