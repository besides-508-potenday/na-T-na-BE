import { ChatMessage } from '@prisma/client';
import {
  IMessageCacheStore,
  REDIS_MESSAGE_LSIT_KEY,
} from '../domain/message.cache-store.interface';
import Message from '../domain/message.type';
import { RedisService } from 'src/redis/redis.service';

export class MessageCacheStoreImpl implements IMessageCacheStore {
  constructor(private readonly redis: RedisService) {}

  async saveMessageListAtCacheStore(
    chatroomId: string,
    messages: Message[],
  ): Promise<Message[] | null> {
    const key = REDIS_MESSAGE_LSIT_KEY(chatroomId);
    await this.redis.setJson(key, messages, 7200);
    return this.redis.getJson(key);
  }
  async getMessageListFromCacheStore(chatroomId: string): Promise<Message[] | null> {
    const key = REDIS_MESSAGE_LSIT_KEY(chatroomId);
    const result = await this.redis.getJson<Message[]>(key);
    if (result && Array.isArray(result)) {
      return result;
    }
    return null;
  }
}
