import QuizList from './quiz-list.type';

export interface IQuizRepository {
  getQuizList(chatroomId: string): Promise<QuizList>;
  saveQuizList(chatroomId: string, quizList: string[]): Promise<QuizList>;
  updateQuiz(chatroomId: string, targetSequence: number, improvedQuiz: string): Promise<QuizList>;
}
