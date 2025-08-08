import { Inject, Injectable } from '@nestjs/common';
import { IQuizRepository } from './quiz.repository.interface';

@Injectable()
export class QuizesService {
  constructor(@Inject('IQuizRepository') private readonly quizRepository: IQuizRepository) {}

  async initializedQuizList(chatroomId: string, quizList: string[]) {
    return await this.quizRepository.saveQuizList(chatroomId, quizList);
  }
}
