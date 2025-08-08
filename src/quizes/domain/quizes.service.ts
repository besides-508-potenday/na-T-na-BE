import { Inject, Injectable } from '@nestjs/common';
import { IQuizRepository } from './quiz.repository.interface';
import { IQuizCacheStore } from './quiz.cache-store.interface';
import {
  InternalServiceErrorException,
  ResourceNotFoundException,
} from '../../common/custom-exceptions/base-custom-exception';
import { UpdateQuizCommand } from './dto/update-quiz.dto';
import QuizList from './quiz-list.type';

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
    const quizListFromRedis = await this.quizCacheStore.getQuizList(chatroomId);
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

  async updateQuiz(command: UpdateQuizCommand) {
    // DB 저장소에 퀴즈 업데이트 적용 후, 퀴즈리스트를 리턴
    const quizList = await this.quizRepository.updateQuiz(
      command.chatroomId,
      command.targetSequence,
      command.improvedQuiz,
    );
    if (quizList.length == 0) {
      throw new InternalServiceErrorException(
        '데이터베이스에서 오류가 발생했습니다.',
        `chatroom_id: ${command.chatroomId} 채팅방에 저장된 퀴즈리스트가 존재하지 않습니다.`,
      );
    }

    // Redis 캐시저장소에 퀴즈리스트 업데이트 적용
    await this.quizCacheStore.saveQuizListAtCacheStore(command.chatroomId, quizList);
  }
}
