import { PrismaService } from '../../prisma/prisma.service';
import QuizList from '../domain/quiz-list.type';
import { IQuizRepository } from '../domain/quiz.repository.interface';

export class QuizRepositoryImpl implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getQuizList(chatroomId: string): Promise<QuizList> {
    const result = await this.prisma.quiz.findMany({
      select: {
        sequence: true,
        quiz: true,
      },
      where: { chatroom_id: chatroomId },
      orderBy: { sequence: 'asc' },
    });

    return result as QuizList;
  }

  async saveQuizList(chatroomId: string, quizList: string[]): Promise<QuizList> {
    // 퀴즈 데이터 생성
    const quizData = quizList.map((quiz, idx) => ({
      sequence: idx + 1,
      quiz,
      chatroom_id: chatroomId,
    }));

    // DB 에 일괄 저장
    await this.prisma.quiz.createMany({
      data: quizData,
    });

    // 저장된 퀴즈 목록 조회 및 반환
    const result = await this.prisma.quiz.findMany({
      select: {
        sequence: true,
        quiz: true,
      },
      where: { chatroom_id: chatroomId },
      orderBy: { sequence: 'asc' },
    });

    return result as QuizList;
  }
}
