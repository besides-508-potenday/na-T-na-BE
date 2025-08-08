import QuizList from './quiz-list.type';

export interface IQuizCacheStore {
  saveQuizListAtCacheStore(chatroomId: string, quizList: QuizList): Promise<QuizList | null>;
  getQuizList(key: string): Promise<QuizList | null>;
}
