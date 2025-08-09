import QuizList from './quiz-list.type';

export const REDIS_QUIZ_LIST_KEY = (chatroomId: string) => `quiz_list-${chatroomId}`;

export interface IQuizCacheStore {
  saveQuizListAtCacheStore(chatroomId: string, quizList: QuizList): Promise<QuizList | null>;
  getQuizList(chatroomId: string): Promise<QuizList | null>;
}
