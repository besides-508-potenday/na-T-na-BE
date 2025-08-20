import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { QuizesModule } from 'src/quizes/quizes.module';
import { RedisService } from 'src/redis/redis.service';
import { of, throwError } from 'rxjs';
import {
  InAppropriateUserMessageException,
  InternalServiceErrorException,
} from 'src/common/custom-exceptions/base-custom-exception';
import { QuizesService } from 'src/quizes/domain/quizes.service';
import { INITIAL_GREETING_FIXED_MESSAGE } from 'src/messages/domain/message-business-rule';
import S3_URL from 'src/common/S3_URL';

const httpServiceMock = {
  post: jest.fn(),
};
const quizServiceMock = {
  initializedQuizList: jest.fn(),
};

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [HttpModule, QuizesModule],
      providers: [
        ExternalApiService,
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            setJson: jest.fn(),
            getJson: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
        {
          provide: QuizesService,
          useValue: quizServiceMock,
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  /** 채팅룸 입장시 챗봇의 퀴즈5개 초기생성 */
  describe('requestCreateSituation: [POST] /situation 외부 API 호출', () => {
    it('API 호출에 성공하여 quiz_list와 first_quiz를 반환한다', async () => {
      // arrange
      const mockQuizList = [
        '학교에서 항상 같이 다니던 친구가 갑자기 나를 피하기 시작해서 마음이 너무 아파...',
        '왜 그런지 물어보고 싶어 근데 어떻게 말해야 할지 모르겠어 😢',
        '혹시 내가 뭘 잘못했나 싶어서 자꾸 생각하게 돼... 😔',
        '다른 친구들이랑 잘 지내는 걸 보면 더 서운하고 외로워져... 😢',
        '이렇게까지 소심해지는 게 맞는 건지 너무 혼란스러워... 😢',
      ];
      const mockResponse = {
        data: {
          quiz_list: mockQuizList,
        },
      };

      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponse));
      const request = {
        chatroom_id: 'test-chatroom-uuid',
        chatbot_name: '투닥이',
        user_nickname: '테스트사용자',
      };

      // act
      const result = await service.requestCreateSituation(request);

      // assert
      expect(result.quiz_list).toEqual(mockQuizList);
      expect(result.first_quiz).toBe(mockQuizList[0]);
    });

    it('API 호출에 실패하여 InternalServiceErrorException 예외를 발생시킨다.', async () => {
      // arrange
      (httpService.post as jest.Mock).mockReturnValueOnce(
        throwError(() => new InternalServiceErrorException('AI 서버 응답오류')),
      );
      const request = {
        chatroom_id: 'test-chatroom-uuid',
        user_nickname: '테스트사용자',
        chatbot_name: '투닥이',
      };

      // act & assert
      await expect(service.requestCreateSituation(request)).rejects.toThrow(
        InternalServiceErrorException,
      );
    });
  });

  /** 사용자 답변에 대한 챗봇 리액션 */
  describe('requestChatbotReactionFromConversation: [POST] /conversation', () => {
    it('API 호출에 성공하여 개선된 퀴즈로 변경된다', async () => {
      // arrange
      const userNickname = '테스트';
      const mockQuizList = [
        '생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...',
        '친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢',
        '이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺',
        '내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭',
        '정말 소중한 친구들에게 축하받고 싶은데, 말 꺼내기가 쉽지 않아... 😢',
      ];
      const mockMessageConversations = [
        `${INITIAL_GREETING_FIXED_MESSAGE(userNickname)} 생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...`, // bot
        '왜 걱정하는거야?', //  퀴즈1 user답변

        '그게... 나 혼자서 다 챙기기엔 너무 힘들어서 😢 친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢', // bot
        '빼놓을수도있지... 뭘또그래', //  퀴즈2 user답변

        '그렇게 말하니까 더 속상해... 😞 진짜로 나만 혼자 남을까봐 불안한걸... 🥺 이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺', // bot
        '생일 혼자보내면 좋지않아?', //  퀴즈3 user답변

        '아니... 혼자 보내는 건 싫은 걸😭 내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭', // bot
        '같이 보내고싶으면 그래야지 뭐', //  퀴즈4 user답변
      ];
      const mockResponse = {
        data: {
          react: '그렇게 말하니 더 슬퍼져... 😢',
          score: 0,
          improved_quiz: '내가 내생일이라고 친구한테 먼저 알려줘도 괜찮을까..?',
          verification: true,
        },
      };
      const request = {
        chatbot_name: '투닥이',
        user_nickname: userNickname,
        current_distance: 5,
        chatroom_id: 'test-chatroom-uuid',
        messageConversations: mockMessageConversations,
        quizList: mockQuizList,
      };
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponse));

      // act
      const result = await service.requestChatbotReactionFromConversation(request);

      // assert
      expect(result.react).toEqual('그렇게 말하니 더 슬퍼져... 😢');
      expect(result.improved_quiz).toEqual('내가 내생일이라고 친구한테 먼저 알려줘도 괜찮을까..?');
      expect(result.score).toEqual(0);
      expect(result.verification).toBeTruthy();
    });

    it('입력메시지에 부적절한 문맥이 감지되어 InAppropriateUserMessageException 예외를 발생시킨다', async () => {
      // arrange
      const inappropriateMessage = '너 정말 바보 멍청이 같다.';
      const userNickname = '테스트';
      const mockQuizList = [
        '생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...',
        '친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢',
        '이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺',
        '내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭',
        '정말 소중한 친구들에게 축하받고 싶은데, 말 꺼내기가 쉽지 않아... 😢',
      ];
      const mockMessageConversations = [
        `${INITIAL_GREETING_FIXED_MESSAGE(userNickname)} 생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...`, // bot
        '왜 걱정하는거야?', //  퀴즈1 user답변

        '그게... 나 혼자서 다 챙기기엔 너무 힘들어서 😢 친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢', // bot
        '빼놓을수도있지... 뭘또그래', //  퀴즈2 user답변

        '그렇게 말하니까 더 속상해... 😞 진짜로 나만 혼자 남을까봐 불안한걸... 🥺 이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺', // bot
        '생일 혼자보내면 좋지않아?', //  퀴즈3 user답변

        '아니... 혼자 보내는 건 싫은 걸😭 내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭', // bot
        inappropriateMessage, // 부적절한메시지
      ];
      const mockResponse = {
        data: {
          react: '',
          improved_quiz: '',
          verification: false,
        },
      };
      const request = {
        chatbot_name: '투닥이',
        user_nickname: userNickname,
        current_distance: 5,
        chatroom_id: 'test-chatroom-uuid',
        messageConversations: mockMessageConversations,
        quizList: mockQuizList,
      };
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponse));

      // act & assert
      await expect(service.requestChatbotReactionFromConversation(request)).rejects.toThrow(
        InAppropriateUserMessageException,
      );
    });

    it('API 호출에 실패하여 InternalServiceErrorException 예외를 발생시킨다', async () => {
      // arrange
      const userNickname = '테스트';
      const mockQuizList = [
        '생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...',
        '친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢',
        '이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺',
        '내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭',
        '정말 소중한 친구들에게 축하받고 싶은데, 말 꺼내기가 쉽지 않아... 😢',
      ];
      const mockMessageConversations = [
        `${INITIAL_GREETING_FIXED_MESSAGE(userNickname)} 생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...`, // bot
        '왜 걱정하는거야?', //  퀴즈1 user답변

        '그게... 나 혼자서 다 챙기기엔 너무 힘들어서 😢 친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢', // bot
        '빼놓을수도있지... 뭘또그래', //  퀴즈2 user답변

        '그렇게 말하니까 더 속상해... 😞 진짜로 나만 혼자 남을까봐 불안한걸... 🥺 이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺', // bot
        '생일 혼자보내면 좋지않아?', //  퀴즈3 user답변

        '아니... 혼자 보내는 건 싫은 걸😭 내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭', // bot
        '같이 보내고싶으면 그래야지 뭐', //  퀴즈 4 user답변
      ];
      const request = {
        chatbot_name: '투닥이',
        user_nickname: userNickname,
        current_distance: 5,
        chatroom_id: 'test-chatroom-uuid',
        messageConversations: mockMessageConversations,
        quizList: mockQuizList,
      };
      (httpService.post as jest.Mock).mockReturnValueOnce(
        throwError(() => new InternalServiceErrorException('AI 서버 응답오류')),
      );
      // act & assert
      await expect(service.requestChatbotReactionFromConversation(request)).rejects.toThrow(
        InternalServiceErrorException,
      );
    });
  });

  /** 챗봇과의 5번의 채팅 마무리 직후에 챗봇 피드백 요청 */
  describe('requestFeedback: [POST] /feedback', () => {
    it('API 호출에 성공하여 챗봇의 마지막편지 반환한다.', async () => {
      // arrange
      const userNickname = 'sdv';
      const chatroomId = '34ea1367-1bba-4047-a03c-ff1d912d96ba';
      const mockConversations = [
        `${INITIAL_GREETING_FIXED_MESSAGE(userNickname)} 생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...`, // bot
        '왜 걱정하는거야?', //  퀴즈1 user답변

        '그게... 나 혼자서 다 챙기기엔 너무 힘들어서 😢 친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢', // bot
        '빼놓을수도있지... 뭘또그래', // 퀴즈2 user답변

        '그렇게 말하니까 더 속상해... 😞 진짜로 나만 혼자 남을까봐 불안한걸... 🥺 이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺', // bot
        '생일 혼자보내면 좋지않아?', //  퀴즈3 user답변

        '아니... 혼자 보내는 건 싫은 걸😭 내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭', // bot
        '같이 보내고싶으면 그래야지 뭐', //  퀴즈 4 user답변

        '그렇게 말하니 더 슬퍼져... 😢 정말 소중한 친구들에게 축하받고 싶은데, 말 꺼내기가 쉽지 않아... 😢',
        '쉽지않겠지만, 받기만 하지말고 적극적으로 다가가는 것도 필요해!', //  퀴즈 5 user답변
      ];
      const request = {
        user_nickname: userNickname,
        chatbot_name: '투닥이',
        chatroom_id: chatroomId,
        conversation: mockConversations,
        current_distance: 5,
      };
      const mockResponse = {
        data: {
          feedback: `안녕 ${userNickname} 오늘 우리 대화하면서 정말 많은 생각을 하게됐어. 처음엔 그냥 가볍게 이야기하려고했지만 너에게 내 마음을 털어 놓으면서 점점 감정이 깊어져버린거같아. 내 생일이 잊혀져서 서운하다고 했을때 네가 별다른 반응을 보이지 않아서 정말 많이 실망했었어.`,
          last_greeting: '빛나는 우리 우정을 염원하며',
          audio_base64: `${S3_URL}/chatrooms/results/${chatroomId}/letter_voice.mp3`,
        },
      };
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponse));

      // act
      const result = await service.requestFeedback(request);

      // assert
      expect(result).toBeDefined();
      expect(result.audio_base64).toEqual(
        `${S3_URL}/chatrooms/results/${chatroomId}/letter_voice.mp3`,
      );
      expect(result.last_greeting).toEqual('빛나는 우리 우정을 염원하며');
      expect(result.feedback).toBeDefined();
    });
    it('API 호출에 실패하여 InternalServiceErrorException 예외를 발생시킨다.', async () => {
      // arrange
      // arrange
      const userNickname = '테스트';
      const chatroomId = 'test-chatroom-uuid';
      const mockConversations = [
        `${INITIAL_GREETING_FIXED_MESSAGE(userNickname)} 생일이 다가오는데 친구들이랑 서먹해서 축하받을 수 있을까 걱정돼...`, // bot
        '왜 걱정하는거야?', //  퀴즈1 user답변

        '그게... 나 혼자서 다 챙기기엔 너무 힘들어서 😢 친구들 사이에서 소외된 느낌이 들어... 혹시 나만 빼놓고 놀면 어떡하지? 😢', // bot
        '빼놓을수도있지... 뭘또그래', // 퀴즈2 user답변

        '그렇게 말하니까 더 속상해... 😞 진짜로 나만 혼자 남을까봐 불안한걸... 🥺 이번 생일도 그냥 조용히 지나가면 어쩌지? 너무 속상해서 마음이 아파... 🥺', // bot
        '생일 혼자보내면 좋지않아?', //  퀴즈3 user답변

        '아니... 혼자 보내는 건 싫은 걸😭 내가 좀 더 다가가야 할까? 그런데 어떻게 해야 할지 모르겠어… 😭', // bot
        '같이 보내고싶으면 그래야지 뭐', //  퀴즈 4 user답변

        '그렇게 말하니 더 슬퍼져... 😢 정말 소중한 친구들에게 축하받고 싶은데, 말 꺼내기가 쉽지 않아... 😢',
        '쉽지않겠지만, 받기만 하지말고 적극적으로 다가가는 것도 필요해!', //  퀴즈 5 user답변
      ];
      const request = {
        user_nickname: userNickname,
        chatbot_name: '투닥이',
        chatroom_id: chatroomId,
        conversation: mockConversations,
        current_distance: 5,
      };
      (httpService.post as jest.Mock).mockReturnValueOnce(
        throwError(() => new InternalServiceErrorException('AI 서버 응답오류')),
      );

      // act & assert
      await expect(service.requestFeedback(request)).rejects.toThrow(InternalServiceErrorException);
    });
  });
});
