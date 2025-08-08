import { Test, TestingModule } from '@nestjs/testing';
import { QuizesService } from './quizes.service';
import QuizList from './quiz-list.type';

const mockQuizRepository = {
  saveQuizList: jest.fn(),
};

describe('QuizesService', () => {
  let service: QuizesService;
  let quizRepository: typeof mockQuizRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizesService,
        {
          provide: 'IQuizRepository',
          useValue: mockQuizRepository,
        },
      ],
    }).compile();

    service = module.get<QuizesService>(QuizesService);
    quizRepository = module.get('IQuizRepository');
  });

  describe('saveQuizList', () => {
    it('퀴즈 리스트 10개 저장에 성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const quizListInput = Array.from({ length: 10 }, (_, i) => `퀴즈 ${i + 1}`);
      const quizListOutput: QuizList = quizListInput.map((quiz, idx) => ({
        quiz,
        sequence: idx + 1,
      }));
      quizRepository.saveQuizList.mockResolvedValue(quizListOutput);

      // act
      const result = await service.initializedQuizList(chatroomId, quizListInput);

      // assert
      expect(quizRepository.saveQuizList).toHaveBeenCalledWith(chatroomId, quizListInput);
      expect(result).toEqual(quizListOutput);
      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ quiz: '퀴즈 1', sequence: 1 });
      expect(result[9]).toEqual({ quiz: '퀴즈 10', sequence: 10 });
    });
  });
});
