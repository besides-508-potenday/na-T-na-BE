import { Test, TestingModule } from '@nestjs/testing';
import { QuizesService } from './quizes.service';
import QuizList from './quiz-list.type';
import { ResourceNotFoundException } from '../../common/custom-exceptions/base-custom-exception';
import { REDIS_QUIZ_LIST_KEY } from './quiz.cache-store.interface';

const mockQuizRepository = {
  saveQuizList: jest.fn(),
  getQuizList: jest.fn(),
  updateQuiz: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateQuiz', () => {
    it('targetSequence(1,2,...,10)에 해당되는 퀴즈의 내용은 새로운퀴즈(improvedQuiz)로 변경되며, 데이터베이스와 캐시저장소에서도 변경이 반영된다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const targetSequence = 2;
      const improvedQuiz = '새로운 내용의 퀴즈';
      const originalQuizList: QuizList = Array.from({ length: 10 }, (_, i) => ({
        quiz: `기존퀴즈 ${i + 1}`,
        sequence: i + 1,
      }));
      const updatedQuizList: QuizList = originalQuizList.map((quiz, idx) =>
        idx === targetSequence - 1 ? { ...quiz, quiz: improvedQuiz } : quiz,
      );

      // DB에서 updateQuiz가 호출되면 변경된 리스트를 반환하도록 mock
      quizRepository.updateQuiz.mockResolvedValue(updatedQuizList);
      quizCacheStore.saveQuizListAtCacheStore.mockResolvedValue(updatedQuizList);

      // act
      await service.updateQuiz({
        chatroomId: chatroomId,
        targetSequence: targetSequence,
        improvedQuiz: improvedQuiz,
      });

      // assert
      expect(quizRepository.updateQuiz).toHaveBeenCalledWith(
        chatroomId,
        targetSequence,
        improvedQuiz,
      );
      expect(quizCacheStore.saveQuizListAtCacheStore).toHaveBeenCalledWith(
        chatroomId,
        updatedQuizList,
      );
      expect(updatedQuizList[targetSequence - 1].quiz).toBe(improvedQuiz);
    });
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
      expect(quizCacheStore.getQuizList).toHaveBeenCalledWith(chatroomId);
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
      expect(quizCacheStore.getQuizList).toHaveBeenCalledWith(chatroomId);
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

  describe('initializedQuizList', () => {
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
