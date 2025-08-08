import { Test, TestingModule } from '@nestjs/testing';
import { QuizesService } from './quizes.service';
import QuizList from './quiz-list.type';
import { REDIS_QUIZ_LIST_KEY } from './quiz.repository.interface';
import { ResourceNotFoundException } from '../../common/custom-exceptions/base-custom-exception';

const mockQuizRepository = {
  saveQuizList: jest.fn(),
  getQuizList: jest.fn(),
};

const mockQuizCacheStore = {
  saveQuizListAtCacheStore: jest.fn(),
  getQuizList: jest.fn(),
};

describe('QuizesService', () => {
  let service: QuizesService;
  let quizRepository: typeof mockQuizRepository;
  let quizCacheStore: typeof mockQuizCacheStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizesService,
        {
          provide: 'IQuizRepository',
          useValue: mockQuizRepository,
        },
        {
          provide: 'IQuizCacheStore',
          useValue: mockQuizCacheStore,
        },
      ],
    }).compile();

    service = module.get<QuizesService>(QuizesService);
    quizRepository = module.get('IQuizRepository');
    quizCacheStore = module.get('IQuizCacheStore');
  });

  describe('getQuizList', () => {
    it('채팅방에 퀴즈리스트가 이미 캐시저장소에 있으면 불러온다.', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const quizListOutput: QuizList = Array.from({ length: 10 }, (_, i) => ({
        quiz: `퀴즈 ${i + 1}`,
        sequence: i + 1,
      }));
      quizCacheStore.getQuizList = jest.fn().mockResolvedValue(quizListOutput);

      // act
      const result = await service.getQuizList(chatroomId);

      // assert
      const key = REDIS_QUIZ_LIST_KEY(chatroomId);
      expect(quizCacheStore.getQuizList).toHaveBeenCalledWith(key);
      expect(result).toEqual(quizListOutput);
      expect(quizRepository.getQuizList).toHaveBeenCalledTimes(0);
    });
    it('채팅방에 퀴즈리스트가 캐시에 저장되어있지 않으면, 데이터베이스에서 불러온다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      quizCacheStore.getQuizList = jest.fn().mockReturnValue(null);

      const quizListOutput: QuizList = Array.from({ length: 10 }, (_, i) => ({
        quiz: `퀴즈 ${i + 1}`,
        sequence: i + 1,
      }));

      quizRepository.getQuizList = jest.fn().mockResolvedValue(quizListOutput);

      // act
      const result = await service.getQuizList(chatroomId);

      // assert
      const key = REDIS_QUIZ_LIST_KEY(chatroomId);
      expect(quizCacheStore.getQuizList).toHaveBeenCalledWith(key);
      expect(quizRepository.getQuizList).toHaveBeenCalledWith(chatroomId);
      expect(result).toEqual(quizListOutput);
    });
    it('데이터베이스에 퀴즈리스트가 존재하지 않으면 ResourceNotFoundException 예외를 발생시킨다', () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      quizCacheStore.getQuizList = jest.fn().mockReturnValue(null);
      quizRepository.getQuizList = jest.fn().mockResolvedValue([]);

      // act & assert
      expect(service.getQuizList(chatroomId)).rejects.toThrow(ResourceNotFoundException);
    });
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
      quizCacheStore.saveQuizListAtCacheStore.mockResolvedValue(quizListOutput);

      // act
      const result = await service.initializedQuizList(chatroomId, quizListInput);

      // assert
      expect(quizRepository.saveQuizList).toHaveBeenCalledWith(chatroomId, quizListInput);
      expect(quizCacheStore.saveQuizListAtCacheStore).toHaveBeenCalledWith(
        chatroomId,
        quizListOutput,
      );
      expect(result).toEqual(quizListOutput);
      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ quiz: '퀴즈 1', sequence: 1 });
      expect(result[9]).toEqual({ quiz: '퀴즈 10', sequence: 10 });
    });
  });
});
