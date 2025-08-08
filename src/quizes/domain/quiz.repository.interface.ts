import QuizList from './quiz-list.type';

export const REDIS_QUIZ_LIST_KEY = (chatroomId: string) => `quiz_list-${chatroomId}`;

export interface IQuizRepository {
  getQuizList(chatroomId: string): Promise<QuizList>;
  saveQuizList(chatroomId: string, quizList: string[]): Promise<QuizList>;
}
