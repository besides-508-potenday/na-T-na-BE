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
  afterAll(() => {
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
    it('챗봇이 사용자 대답에 부정적으로 평가하면, heart_life 값이 1 감소하며, turn_count가 1 감소한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-id';
      const mockChatroom = {
        id: chatroomId,
        heart_life: 5,
        turn_count: 5,
        current_distance: 5,
      };
      chatroomRepository.findChatroomById = jest.fn().mockResolvedValue(mockChatroom);
      chatroomRepository.negativeChatbotReaction = jest.fn().mockResolvedValue({
        ...mockChatroom,
        heart_life: mockChatroom.heart_life - 1,
        turn_count: mockChatroom.turn_count - 1,
      });

      // act
      const result = await service.updateDistanceWithChatbot(chatroomId, 0);
      // assert
      expect(result.heart_life).toBe(4);
      expect(result.turn_count).toBe(4);
      expect(result.current_distance).toBe(5);
    });
    it('챗봇이 사용자 대답에 긍정적으로 평가하면, current_distance 값이 1 감소하며, turn_count가 1 감소한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-id';
      const mockChatroom = {
        id: chatroomId,
        heart_life: 5,
        turn_count: 5,
        current_distance: 5,
      };
      chatroomRepository.findChatroomById = jest.fn().mockResolvedValue(mockChatroom);
      chatroomRepository.negativeChatbotReaction = jest.fn().mockResolvedValue({
        ...mockChatroom,
        current_distance: mockChatroom.current_distance - 1,
        turn_count: mockChatroom.turn_count - 1,
      });
      // act
      const result = await service.updateDistanceWithChatbot(chatroomId, 0);
      // assert
      expect(result.heart_life).toBe(5);
      expect(result.turn_count).toBe(4);
      expect(result.current_distance).toBe(4);
    });
  });
  describe('getChatroomById', () => {
    it('chatroom_id로 채팅방과 연관된 모든정보들을 조회를 할 수 있다.', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const mockChatroom = {
        id: chatroomId,
        participants: [
          {
            user: { id: 'user-uuid', nickname: '테스트 유저' },
            chatbot: { id: 1, name: '투닥이' },
          },
        ],
        quizes: Array.from({ length: 5 }, (_, i) => ({
          id: `quiz-uuid-${i + 1}`,
          sequence: i + 1,
          quiz: `퀴즈 ${i + 1}`,
          chatroom_id: chatroomId,
        })),
        messages: Array.from({ length: 15 }, (_, i) => ({
          id: `message-uuid-${i + 1}`,
          content: `메시지 ${i + 1} 메시지 (${(i + 1) % 3 === 0 ? 'USER' : 'BOT'})`,
          sender_type: (i + 3) % 3 === 0 ? 'USER' : 'BOT',
          chatroom_id: chatroomId,
        })),
      };
      chatroomRepository.findChatroomById = jest.fn().mockResolvedValue(mockChatroom);

      // act
      const result = await service.getChatroomById(chatroomId);

      // assert
      expect(chatroomRepository.findChatroomById).toHaveBeenCalledWith(chatroomId);
      expect(result.id).toBe(chatroomId);
      expect(result.quizes).toHaveLength(5);
      expect(result.messages).toHaveLength(15);
      expect(result.participants[0].user.nickname).toBe('테스트 유저');
      expect(result.participants[0].chatbot.name).toBe('투닥이');
    });
  });
});
