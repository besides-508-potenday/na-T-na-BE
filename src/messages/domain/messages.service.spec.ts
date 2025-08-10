import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { SenderType } from '@prisma/client';
import Message from './message.type';
import {
  convertConversation,
  feedbackConversation,
  INITIAL_GREETING_FIXED_MESSAGE,
} from './message-business-rule';
import { ResourceNotFoundException } from 'src/common/custom-exceptions/base-custom-exception';

const mockMessageRepositoryImpl = {
  saveMessage: jest.fn(),
  getMessagesByChatroomId: jest.fn(),
  getUserMessages: jest.fn(),
  getChatbotMessages: jest.fn(),
};

const mockMessageCahceStoreImpl = {
  saveMessageListAtCacheStore: jest.fn(),
  getMessageListFromCacheStore: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: typeof mockMessageRepositoryImpl;
  let messageCacheStore: typeof mockMessageCahceStoreImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: 'IMessageRepository',
          useValue: mockMessageRepositoryImpl,
        },
        {
          provide: 'IMessageCacheStore',
          useValue: mockMessageCahceStoreImpl,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<typeof mockMessageRepositoryImpl>('IMessageRepository');
    messageCacheStore = module.get<typeof mockMessageCahceStoreImpl>('IMessageCacheStore');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('feedbackConversation', () => {
    it('피드백 요청할때 conversation', () => {
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },

        { sender_type: SenderType.USER, content: '답변1' },

        { sender_type: SenderType.BOT, content: '퀴즈1-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈2' },

        { sender_type: SenderType.USER, content: '답변2' },

        { sender_type: SenderType.BOT, content: '퀴즈2-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈3' },

        { sender_type: SenderType.USER, content: '답변3' },

        { sender_type: SenderType.BOT, content: '퀴즈3-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈4' },

        { sender_type: SenderType.USER, content: '답변4' },

        { sender_type: SenderType.BOT, content: '퀴즈4-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈5' },
        { sender_type: SenderType.USER, content: '답변5' },
      ];
      const expectedWholeConversation = [
        '첫인사' + ' ' + '퀴즈1',
        '답변1',
        '퀴즈1-답변-리액션' + ' ' + '퀴즈2',
        '답변2',
        '퀴즈2-답변-리액션' + ' ' + '퀴즈3',
        '답변3',
        '퀴즈3-답변-리액션' + ' ' + '퀴즈4',
        '답변4',
        '퀴즈4-답변-리액션' + ' ' + '퀴즈5',
        '답변5',
      ];

      const result = feedbackConversation(messages);
      expect(result).toEqual(expectedWholeConversation);
    });
  });

  describe('convertConversation', () => {
    it('1번째 답변을 입력했을 때', () => {
      const answer = '답변1';
      const expectedConversation = ['첫인사' + ' ' + '퀴즈1', answer];
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },
      ];
      const result = convertConversation(messages, answer);
      expect(result).toEqual(expectedConversation);
    });
    it('2번째 답변을 입력했을 때', () => {
      const answer = '답변2';
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },

        { sender_type: SenderType.USER, content: '답변1' },

        { sender_type: SenderType.BOT, content: '퀴즈1-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈2' },
      ];
      const expectedConversation = [
        '첫인사' + ' ' + '퀴즈1',
        '답변1',
        '퀴즈1-답변-리액션' + ' ' + '퀴즈2',
        answer,
      ];
      const result = convertConversation(messages, answer);
      expect(result).toEqual(expectedConversation);
    });
    it('3번째 답변을 입력했을 때', () => {
      const answer = '답변3';
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },

        { sender_type: SenderType.USER, content: '답변1' },

        { sender_type: SenderType.BOT, content: '퀴즈1-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈2' },

        { sender_type: SenderType.USER, content: '답변2' },

        { sender_type: SenderType.BOT, content: '퀴즈2-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈3' },
      ];
      const expectedConversation = [
        '첫인사' + ' ' + '퀴즈1',
        '답변1',

        '퀴즈1-답변-리액션' + ' ' + '퀴즈2',
        '답변2',

        '퀴즈2-답변-리액션' + ' ' + '퀴즈3',
        answer,
      ];
      const result = convertConversation(messages, answer);
      expect(result).toEqual(expectedConversation);
    });
    it('4번째 답변을 입력했을 때', () => {
      const answer = '답변4';
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },

        { sender_type: SenderType.USER, content: '답변1' },

        { sender_type: SenderType.BOT, content: '퀴즈1-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈2' },

        { sender_type: SenderType.USER, content: '답변2' },

        { sender_type: SenderType.BOT, content: '퀴즈2-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈3' },

        { sender_type: SenderType.USER, content: '답변3' },

        { sender_type: SenderType.BOT, content: '퀴즈3-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈4' },
      ];
      const expectedConversation = [
        '첫인사' + ' ' + '퀴즈1',
        '답변1',

        '퀴즈1-답변-리액션' + ' ' + '퀴즈2',
        '답변2',

        '퀴즈2-답변-리액션' + ' ' + '퀴즈3',
        '답변3',

        '퀴즈3-답변-리액션' + ' ' + '퀴즈4',
        answer,
      ];
      const result = convertConversation(messages, answer);
      expect(result).toEqual(expectedConversation);
    });
    it('5번째 답변을 입력했을 때', () => {
      const answer = '답변5';
      const messages = [
        { sender_type: SenderType.BOT, content: '첫인사' },
        { sender_type: SenderType.BOT, content: '퀴즈1' },
        { sender_type: SenderType.USER, content: '답변1' },
        { sender_type: SenderType.BOT, content: '퀴즈1-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈2' },
        { sender_type: SenderType.USER, content: '답변2' },
        { sender_type: SenderType.BOT, content: '퀴즈2-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈3' },
        { sender_type: SenderType.USER, content: '답변3' },
        { sender_type: SenderType.BOT, content: '퀴즈3-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈4' },
        { sender_type: SenderType.USER, content: '답변4' },
        { sender_type: SenderType.BOT, content: '퀴즈4-답변-리액션' },
        { sender_type: SenderType.BOT, content: '퀴즈5' },
      ];
      const expectedConversation = [
        '첫인사' + ' ' + '퀴즈1',
        '답변1',

        '퀴즈1-답변-리액션' + ' ' + '퀴즈2',
        '답변2',

        '퀴즈2-답변-리액션' + ' ' + '퀴즈3',
        '답변3',

        '퀴즈3-답변-리액션' + ' ' + '퀴즈4',
        '답변4',

        '퀴즈4-답변-리액션' + ' ' + '퀴즈5',
      ];
      const result = convertConversation(messages, answer);
      expect(result).toEqual(expectedConversation);
    });
  });

  describe('getMessagesByChatroomId', () => {
    it('채팅방의 전체 메시지 내역 조회성공한다 - 데이터베이스 조회', async () => {
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
    it('캐시저장소에 데이터가 없고, 데이터베이스에도 없다면 ResourceNotFoundException 예외가 발생한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-id';
      messageCacheStore.getMessageListFromCacheStore = jest.fn().mockReturnValue(null);
      messageRepository.getMessagesByChatroomId = jest.fn().mockReturnValue([]);

      // act & assert
      await expect(service.getMessagesByChatroomId(chatroomId)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });
  describe('getUserMessages', () => {
    it('채팅방 유저 메시지 내역 조회 성공한다', async () => {
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
      const userMessages = messages.filter((message) => message.sender_type === SenderType.USER);
      messageRepository.getUserMessages = jest.fn().mockReturnValue(userMessages);

      // act
      const result = await service.getUserMessages(chatroomId);

      // assert
      expect(result).toEqual(userMessages);
      expect(result[0].sender_type).toBe(SenderType.USER);
      expect(result.length).toEqual(1);
    });
  });
  describe('getChatbotMessages', () => {
    it('채팅방 챗봇 메시지 내역 조회 성공한다', async () => {
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
      const botMessages = messages.filter((message) => message.sender_type === SenderType.BOT);
      messageRepository.getChatbotMessages = jest.fn().mockReturnValue(botMessages);

      // act
      const result = await service.getChatbotMessages(chatroomId);

      // assert
      expect(result).toEqual(botMessages);
      expect(result[0].sender_type).toBe(SenderType.BOT);
      expect(result.length).toEqual(2);
    });
  });

  describe('createMessage', () => {
    it('sender_type=USER 인 메시지 생성을 성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const userId = 'test-user-uuid';
      const chatbotId = 1;
      const content = '퀴즈1에 대한 유저 답변';
      const messages: Message[] = [
        {
          content: '챗봇 인사',
          sender_type: SenderType.BOT,
        },
        {
          content: '퀴즈1',
          sender_type: SenderType.BOT,
        },
        {
          content: content,
          sender_type: SenderType.USER,
        },
      ];

      messageRepository.saveMessage = jest.fn().mockReturnValue(messages);

      // act
      const result = await service.createMessage(
        chatroomId,
        content,
        SenderType.USER,
        chatbotId,
        userId,
      );

      // assert
      expect(result).toEqual(messages);
      expect(result[2].sender_type).toEqual(SenderType.USER);
      expect(result[2].content).toEqual(content);
    });
    it('sender_type=BOT 인 메시지 생성을 성공한다', async () => {
      // arrange
      const chatroomId = 'test-chatroom-uuid';
      const userId = 'test-user-uuid';
      const chatbotId = 1;
      const content = '퀴즈1 유저답변에 대한 리액션 1';

      const messages: Message[] = [
        {
          content: '챗봇 인사',
          sender_type: SenderType.BOT,
        },
        {
          content: '퀴즈1',
          sender_type: SenderType.BOT,
        },
        {
          content: '퀴즈1 유저답변',
          sender_type: SenderType.USER,
        },
        {
          content: '퀴즈1 유저답변에 대한 리액션 1',
          sender_type: SenderType.BOT,
        },
      ];
      messageRepository.saveMessage = jest.fn().mockReturnValue(messages);

      // act
      const result = await service.createMessage(
        chatroomId,
        content,
        SenderType.BOT,
        chatbotId,
        userId,
      );

      // assert
      expect(result[messages.length - 1].sender_type).toEqual(SenderType.BOT);
      expect(result[messages.length - 1].content).toEqual(content);
    });
  });
});
