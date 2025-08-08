import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomsService } from './chatrooms.service';
import { ChatroomRepositoryImpl } from '../infrastructure/chatroom.repository';

const mockChatroomRepositoryImpl = {
  createChatroom: jest.fn(),
  createChatroomParticipants: jest.fn(),
  findChatroomById: jest.fn(),
  positiveChatbotReaction: jest.fn(),
  negativeChatbotReaction: jest.fn(),
  updateTurnCount: jest.fn(),
};

describe('ChatroomsService', () => {
  let service: ChatroomsService;
  let chatroomRepository: typeof mockChatroomRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatroomsService,
        { provide: 'IChatroomRepository', useValue: ChatroomRepositoryImpl },
      ],
    }).compile();

    service = module.get<ChatroomsService>(ChatroomsService);
    chatroomRepository = module.get<typeof mockChatroomRepositoryImpl>('IChatroomRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChatroom', () => {
    it('createChatroom(): 채팅방생성을 성공한다', async () => {
      // arrange
      const mockChatroom = { id: 'test-chatroom-id' };
      const userId = 'tst-user-id';
      const chatbotId = 1;

      chatroomRepository.createChatroom = jest.fn().mockReturnValue(mockChatroom);
      chatroomRepository.createChatroomParticipants = jest.fn().mockReturnValue({
        user_id: userId,
        chatbot_id: chatbotId,
        chatroom_id: mockChatroom.id,
      });

      // act
      const result = await service.createChatroom(userId, chatbotId);

      // assert
      expect(chatroomRepository.createChatroom).toHaveBeenCalled();
      expect(chatroomRepository.createChatroomParticipants).toHaveBeenCalledWith(
        userId,
        chatbotId,
        mockChatroom.id,
      );
      expect(result).toEqual(mockChatroom);
    });
  });
  describe('updateChatbotTurnsCounts', () => {
    it('1. 채팅방이 존재하지 않으면 ResourceNotFoundException 예외를 발생한다', () => {
      // arrange
      const chatroomId = 'not-exist-id';
      chatroomRepository.findChatroomById = jest.fn().mockReturnValue(null);

      // act & assert
      expect(service.updateChatTurnCounts(chatroomId)).rejects.toThrow(
        '채팅방이 존재하지 않습니다.',
      );
    });
    it('2. turn_count 값이 1만큼 감소 업데이트에 성공한다', async () => {
      // arrange
      const chatroomId = 'exist-id';
      const mockChatroom = { id: chatroomId, turn_count: 10 };

      // act
      chatroomRepository.findChatroomById = jest.fn().mockReturnValue(mockChatroom);
      chatroomRepository.updateTurnCount = jest
        .fn()
        .mockReturnValue({ ...mockChatroom, turn_count: 9 });

      // assert
      await service.updateChatTurnCounts(chatroomId);

      expect(chatroomRepository.updateTurnCount).toHaveBeenCalledWith(
        chatroomId,
        mockChatroom.turn_count,
      );
    });
    it('3. turn_count 값이 0 인 경우에는 더이상 감소하지 않고 0으로 유지한다.', async () => {
      // arrange
      const chatroomId = 'exist-id';
      const mockChatroom = { id: chatroomId, turn_count: 0 };

      // act
      chatroomRepository.findChatroomById = jest.fn().mockReturnValue(mockChatroom);
      chatroomRepository.updateTurnCount = jest
        .fn()
        .mockReturnValue({ ...mockChatroom, turn_count: 0 });

      // assert
      await service.updateChatTurnCounts(chatroomId);

      expect(chatroomRepository.updateTurnCount).toHaveBeenCalledWith(
        chatroomId,
        mockChatroom.turn_count,
      );
    });
  });
  describe('updateDistanceWithChatbot', () => {
    it('챗봇이 사용자 대답에 부정적으로 평가하면, heart_life 값이 1 감소하며, turn_count가 1 감소한다', () => {});
    it('챗봇이 사용자 대답에 긍정적으로 평가하면, current_distance 값이 1 감소하며, turn_count가 1 감소한다', () => {});
  });
});
