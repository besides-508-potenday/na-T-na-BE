import { RedisService } from '../../redis/redis.service';
import QuizList from '../domain/quiz-list.type';
import { IQuizCacheStore } from '../domain/quiz.cache-store.interface';
import { REDIS_QUIZ_LIST_KEY } from '../domain/quiz.repository.interface';

export class QuizCacheStoreImpl implements IQuizCacheStore {
  constructor(private readonly redis: RedisService) {}

  async getQuizList(key: string): Promise<QuizList | null> {
    const result = await this.redis.getJson<QuizList>(key);
    if (result && Array.isArray(result)) {
      return result;
    }
    return null;
  }

  async saveQuizListAtCacheStore(chatroomId: string, quizList: QuizList): Promise<QuizList | null> {
    // key 저장
    const key = REDIS_QUIZ_LIST_KEY(chatroomId);

    // 2 시간동안 레디스에 저장
    await this.redis.setJson(key, quizList, 7200);

    return this.redis.getJson(key);
  }
}
