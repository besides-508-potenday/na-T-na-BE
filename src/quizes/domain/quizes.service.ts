import { Inject, Injectable } from '@nestjs/common';
import { IQuizRepository, REDIS_QUIZ_LIST_KEY } from './quiz.repository.interface';
import { IQuizCacheStore } from './quiz.cache-store.interface';
import { ResourceNotFoundException } from '../../common/custom-exceptions/base-custom-exception';

@Injectable()
export class QuizesService {
  constructor(
    @Inject('IQuizRepository') private readonly quizRepository: IQuizRepository,
    @Inject('IQuizCacheStore') private readonly quizCacheStore: IQuizCacheStore,
  ) {}

  async initializedQuizList(chatroomId: string, quizList: string[]) {
    // 데이터베이스에 저장
    const result = await this.quizRepository.saveQuizList(chatroomId, quizList);

    // 레디스에 저장 - key: chatroomId, value: (result에 해당되는 퀴즈리스트)
    await this.quizCacheStore.saveQuizListAtCacheStore(chatroomId, result);

    return result;
  }

  async getQuizList(chatroomId: string) {
    // 레디스에 이미 있으면 가져온다.
    const key = REDIS_QUIZ_LIST_KEY(chatroomId);
    const quizListFromRedis = await this.quizCacheStore.getQuizList(key);
    if (quizListFromRedis) {
      return quizListFromRedis;
    }

    // 레디스에 없으면 db에서 가져온다.
    const quizListFromDb = await this.quizRepository.getQuizList(chatroomId);
    if (quizListFromDb.length > 0) {
      return quizListFromDb;
    }

    throw new ResourceNotFoundException(
      '퀴즈가 존재하지 않습니다.',
      `chatroom_id: ${chatroomId} 채팅방에 등록된 퀴즈가 존재하지 않습니다.`,
    );
  }
}
