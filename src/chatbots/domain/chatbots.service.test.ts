import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotsService } from './chatbots.service';

const mockChatbotRepositoryImpl = {
  getChatbots: jest.fn(),
  getChatbotById: jest.fn(),
  getChatbotByChatroomId: jest.fn(),
};

describe('ChatbotsService', () => {
  let service: ChatbotsService;
  let chatbotRepository: typeof mockChatbotRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotsService,
        { provide: 'IChatbotRepository', useValue: mockChatbotRepositoryImpl },
      ],
    }).compile();

    service = module.get<ChatbotsService>(ChatbotsService);
    chatbotRepository = module.get<typeof mockChatbotRepositoryImpl>('IChatbotRepository');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getChatbotByChatroomId', () => {
    it('채팅방 고유식별자(chatroom_id)로 연결된 챗봇1개를 검색에 성공한다.', async () => {
      // arrange
      const chatroomId = 'existed-chatroom-uuid';
      const mockResult = {
        chatbot: {
          id: 1,
          name: '투닥이',
          speciality: '공감 스킬 향상을 위한 조력 메이트',
          is_unknown: false,
          personality: '당신의 이야기에 감정 200% 몰입',
          created_at: Date.now(),
        },
        id: 'exited-chatroom-participant-id',
        chatroom_id: 'existed-chatroom-uuid',
        user_id: 'exited-chatroom-user-id',
        chatbot_id: 1,
      };
      chatbotRepository.getChatbotByChatroomId.mockReturnValue(mockResult);

      // act
      const result = await service.getChatbotByChatroomId(chatroomId);

      // assert
      expect(result).toBeDefined();
      expect(result.chatbot.name).toEqual('투닥이');
      expect(chatbotRepository.getChatbotByChatroomId).toHaveBeenCalled();
    });
    it('채팅방 고유식별자(chatroom_id)로 연결된 챗봇이 존재하지 않으면 null을 반환한다.', async () => {
      // arrange
      const notExistedChatroomId = 'not-existed-chatroom-uuid';
      chatbotRepository.getChatbotByChatroomId.mockReturnValue(null);

      // act
      const result = await service.getChatbotByChatroomId(notExistedChatroomId);

      // assert
      expect(result).toBeNull();
      expect(chatbotRepository.getChatbotByChatroomId).toHaveBeenCalled();
    });
  });

  describe('getChatbot()', () => {
    it('호출하면 챗봇 정보(챗봇명)을 조회에 성공한다', async () => {
      // arrange
      const existedChatbotId = 1;
      const mockChatbot = { id: 1, name: '투닥이' };
      chatbotRepository.getChatbotById.mockReturnValue(mockChatbot);

      // act
      const result = await service.getChatbot(existedChatbotId);

      // assert
      expect(result.name).toEqual('투닥이');
      expect(result.id).toEqual(1);
      expect(chatbotRepository.getChatbotById).toHaveBeenCalled();
    });
    it('챗봇 식별자에 알맞는 챗봇이 존재하지 않으면 null을 반환한다', async () => {
      // arrange
      const notExistedChatbotId = 999;
      chatbotRepository.getChatbotById.mockReturnValue(null);

      // act
      const result = await service.getChatbot(notExistedChatbotId);

      // assert
      expect(result).toBeNull();
      expect(chatbotRepository.getChatbotById).toHaveBeenCalled();
    });
  });

  describe('getChatbots()', () => {
    it('호출하면 챗봇정보, 챗봇성격, 챗봇 프로필을 포함한 챗봇 정보 리스트 반환에 성공한다', async () => {
      // arrange
      const mockData = [
        {
          chatbot_id: 1,
          chatbot_name: '투닥이',
          chatbot_speciality: '공감 스킬 향상을 위한 조력 메이트',
          chatbot_personality: '당신의 이야기에 감정 200% 몰입',
          is_unknown: false,
        },
        {
          chatbot_id: 2,
          chatbot_name: '썸고수_???',
          chatbot_speciality: '연애 공감 시뮬레이션',
          chatbot_personality: '???',
          is_unknown: true,
        },
      ];
      chatbotRepository.getChatbots.mockReturnValue(mockData);

      // act
      const result = await service.getChatbots();

      // assert
      // 챗봇리스트 개수
      expect(result.length).toEqual(2);

      // 활성챗봇
      expect(result[0]).toHaveProperty(
        'chatbot_profile_image',
        'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/1/profile.png',
      );
      expect(result[0].is_unknown).toBe(false);
      expect(result[0].chatbot_name).toEqual('투닥이');

      // 비활성 챗봇
      expect(result[1]).toHaveProperty(
        'chatbot_profile_image',
        'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/2/unknown.png',
      );
      expect(result[1].is_unknown).toBe(true);
      expect(result[1].chatbot_personality).toEqual('???');

      expect(chatbotRepository.getChatbots).toHaveBeenCalled();
    });
  });
});
