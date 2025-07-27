export interface IRedisService {
  set(key: string, value: string, ttl?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  setJson(key: string, value: any, ttl?: number): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
  hset(key: string, field: string, value: string): Promise<void>;
  hget(key: string, field: string): Promise<string | null>;
}
