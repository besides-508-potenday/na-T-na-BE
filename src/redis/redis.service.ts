import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { IRedisService } from './redis.service.interface';

@Injectable()
export class RedisService implements IRedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }
  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }
  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, ttl);
  }
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }
  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }
}
