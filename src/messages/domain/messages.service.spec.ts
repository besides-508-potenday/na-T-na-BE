import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { MessageRepositoryImpl } from '../infrastructure/message.repository';
import { SenderType } from '@prisma/client';
import Message from './message.type';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: typeof mockMessageRepositoryImpl;

  const mockMessageRepositoryImpl = {
    saveMessage: jest.fn(),
    getMessagesByChatroomId: jest.fn(),
    getUserMessages: jest.fn(),
    getChatbotMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: 'IMessageRepository',
          useValue: mockMessageRepositoryImpl,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<typeof mockMessageRepositoryImpl>('IMessageRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessagesByChatroomId', () => {
    it('채팅방의 전체 메시지 내역 조회성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-id';
      const messages: Message[] = [
        { sender_type: SenderType.BOT, content: '안녕... 테스트유저!' }, // 인사
        {
          sender_type: SenderType.BOT,
          content: '친구에게 서운한 일이 있었는데 어떻게 말 꺼내야 할지 모르겠어... 😔',
        }, // 퀴즈 1
        { sender_type: SenderType.USER, content: '먼저 다가가서 좋아하는 것을 물어봐바' }, // 퀴즈 1 답변
      ];
      messageRepository.getMessagesByChatroomId = jest.fn().mockResolvedValue(messages);

      // act
      const result = await service.getMessagesByChatroomId(chatroomId);

      // assert
      expect(result).toEqual(messages);
    });
  });
  describe('getUserMessages', () => {
    it('채팅방 유저 메시지 내역 조회 성공한다', async () => {
      // arrange
      // act
      // assert
    });
  });
  describe('getChatbotMessages', () => {
    it('채팅방 챗봇 메시지 내역 조회 성공한다', async () => {
      // arrange
      // act
      // assert
    });
  });

  describe('createMessage', () => {
    it('sender_type=USER 인 메시지 생성을 성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const userId = 'test-user-uuid';
      const chatbotId = 1;
      const content = '응 그래 안녕...! 나는  유저야!';

      messageRepository.saveMessage = jest.fn().mockReturnValue({
        chatroom_id: chatroomId,
        chatbot_id: chatbotId,
        user_id: userId,
        content: content,
        sender_type: SenderType.USER,
      });

      // act
      const result = await service.createMessage(
        chatroomId,
        content,
        SenderType.USER,
        chatbotId,
        userId,
      );

      // assert
      expect(result.sender_type).toEqual(SenderType.USER);
      expect(result.content).toEqual(content);
    });
    it('sender_type=BOT 인 메시지 생성을 성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const userId = 'test-user-uuid';
      const chatbotId = 1;
      const content = '안녕...! 나는 투닥이야!';

      messageRepository.saveMessage = jest.fn().mockReturnValue({
        chatroom_id: chatroomId,
        chatbot_id: chatbotId,
        user_id: userId,
        content: content,
        sender_type: SenderType.BOT,
      });

      // act
      const result = await service.createMessage(
        chatroomId,
        content,
        SenderType.BOT,
        chatbotId,
        userId,
      );

      // assert
      expect(result.sender_type).toEqual(SenderType.BOT);
      expect(result.content).toEqual(content);
    });
  });
});
