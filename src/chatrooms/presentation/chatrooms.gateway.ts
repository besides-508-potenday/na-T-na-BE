import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatroomsService } from '../domain/chatrooms.service';
import { UsersService } from '../../users/domain/users.service';
import { JoinRoomRequest } from './dto/join-room.dto';
import { Logger } from '@nestjs/common';
import { ChatbotsService } from '../../chatbots/domain/chatbots.service';
import { ExternalApiService } from '../../external-api/external-api.service';
import {
  convertConversation,
  INITIAL_GREETING_FIXED_MESSAGE,
  INVALID_MESSAGE_KEYWORDS,
  LAST_FIXED_MESSAGE,
} from '../../messages/domain/message-business-rule';
import {
  BaseCustomException,
  InAppropriateUserMessageException,
  InternalServiceErrorException,
  MessageLengthOverMaximumException,
  ResourceNotFoundException,
} from '../../common/custom-exceptions/base-custom-exception';
import { OK, POLICY_ERROR } from '../domain/chatting-socket-business-rule';
import S3_URL from '../../common/S3_URL';
import { SenderType } from '@prisma/client';
import { AnswerRequest } from './dto/answer.dto';
import { QuizesService } from 'src/quizes/domain/quizes.service';
import { MessagesService } from 'src/messages/domain/messages.service';
import Message from 'src/messages/domain/message.type';
import { CHATBOT_TURN_COUNT } from '../domain/chatroom-feedback-buisness-rule';

// 클라이언트 패킷들이 게이트웨이를 통해서 들어온다.
@WebSocketGateway({
  cors: {
    // origin: process.env.FRONTEND_URL,
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  },
})
export class ChatroomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatroomsGateway.name);
  private sessions = new Map<
    string,
    {
      socket: Socket;
      chatroom_id: string;
      user_id: string;
    }
  >();

  // 웹소켓 서버 정의
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatroomService: ChatroomsService,
    private readonly userService: UsersService,
    private readonly chatbotService: ChatbotsService,
    private readonly quizService: QuizesService,
    private readonly externalApiService: ExternalApiService,
    private readonly messageService: MessagesService,
  ) {}

  // 소켓연결
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  // 소켓 연결 해제
  handleDisconnect(client: Socket) {
    this.sessions.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('error')
  handleTestError(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.emit('error', { message: '메시지가 발생했어요' });
    throw new InAppropriateUserMessageException();
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(@MessageBody() request: JoinRoomRequest, @ConnectedSocket() client: Socket) {
    try {
      // 유저생성
      const user = await this.userService.createUser(request.user_nickname);

      // 챗봇검색
      const chatbot = await this.chatbotService.getChatbot(request.chatbot_id);
      if (!chatbot) {
        throw new ResourceNotFoundException('챗봇이 존재하지 않습니다.');
      }

      // 채팅방 생성
      const chatroom = await this.chatroomService.createChatroom(user.id, request.chatbot_id);

      // 세션 생성
      this.sessions.set(client.id, {
        socket: client,
        chatroom_id: chatroom.id,
        user_id: user.id,
      });

      // 인사말(고정텍스트) 생성
      const initialGreetingMessage = INITIAL_GREETING_FIXED_MESSAGE(user.nickname);

      // (AI) [POST] /situation 요청 & 퀴즈리스트 저장
      const situationResponse = await this.externalApiService.requestCreateSituation({
        chatroom_id: chatroom.id,
        user_nickname: user.nickname,
        chatbot_name: chatbot.name,
      });
      const firstQuizMessage = situationResponse.first_quiz;

      // 챗봇 첫인사 메시지 저장
      await this.messageService.createMessage(
        chatroom.id,
        initialGreetingMessage,
        SenderType.BOT,
        chatbot.id,
        user.id,
      );

      // 챗봇 첫번째 퀴즈 메시지 저장
      await this.messageService.createMessage(
        chatroom.id,
        firstQuizMessage,
        SenderType.BOT,
        chatbot.id,
        user.id,
      );

      await this.chatroomService.updateChatTurnCounts(chatroom.id);

      // 'join_room' 이벤트 응답을 한다.
      setTimeout(() => {
        client.emit('quiz', {
          status: 'OK',
          data: {
            user_id: user.id,
            user_nickname: user.nickname,
            chatbot_id: chatbot.id,
            chatbot_name: chatbot.name,
            chatroom_id: chatroom.id,
            sender_type: SenderType.BOT,
            message: firstQuizMessage,
          },
        });
      }, 1000);

      const response = {
        status: OK,
        data: {
          user_id: user.id,
          user_nickname: user.nickname,
          chatbot_id: chatbot.id,
          chatbot_name: chatbot.name,
          chatroom_id: chatroom.id,
          current_distance: chatroom.current_distance,
          heart_life: chatroom.heart_life,
          sender_type: SenderType.BOT,
          message: initialGreetingMessage,
          chatbot_profile_image: `${S3_URL}/chatbots/${chatbot.id}/profile.png`,
          turn_count: chatroom.turn_count,
        },
      };
      this.logger.log(response.data.message);
      this.logger.log(firstQuizMessage);
      return response;
    } catch (error) {
      if (error instanceof BaseCustomException) {
        this.logger.log(error.message);
        throw error;
      }

      // 그 이외의 문제발생은 UI 에러로 핸들링한다.
      this.logger.error('error');
      throw new InternalServiceErrorException('예상외의 에러가 발생했습니다.', error);
    }
  }

  /**
   * 서버는 클라이언트에서 발행한 'answer' 이벤트를 수신하여 응답을 한다.
   */
  @SubscribeMessage('answer')
  async handleQuiz(
    @MessageBody() request: AnswerRequest,
    @ConnectedSocket() client: Socket,
    payload: any,
  ) {
    try {
      const { chatroom_id, message, chatbot_id, user_id, sender_type } = request;

      // 유저조회
      const user = await this.userService.getOneUser(user_id);
      if (!user) {
        throw new ResourceNotFoundException(
          '존재하지 않은 유저입니다.',
          `id: ${user_id} 인 유저는 존재하지 않습니다.`,
        );
      }

      // 챗봇 조회
      const chatbot = await this.chatbotService.getChatbot(chatbot_id);
      if (!chatbot)
        throw new ResourceNotFoundException(
          '존재하지 않은 챗봇입니다.',
          `id: ${chatbot_id} 인 챗봇은 존재하지 않습니다.`,
        );

      // 현재 채팅방 조회
      const chatroom = await this.chatroomService.getChatroomById(chatroom_id);
      if (!chatroom) {
        throw new ResourceNotFoundException(
          '존재하지 않은 채팅방입니다.',
          `id: ${chatroom_id} 인 채팅방은 존재하지 않습니다.`,
        );
      }

      const { turn_count, heart_life, current_distance } = chatroom;

      // 퀴즈 리스트조회
      const quizList = await this.quizService.getQuizList(chatroom_id);

      // 메시지 조회
      const messages = await this.messageService.getMessagesByChatroomId(chatroom_id);
      const messageConversations = convertConversation(messages, request.message);

      // 부정적 키워드 검사
      this.checkInvalidKeywords(message);

      // [AI 서버에게 요청] /conversation
      // ai서버한테서 리액션과 신규퀴즈를 받는다
      let conversationResponse;
      try {
        conversationResponse = await this.externalApiService.requestChatbotReactionFromConversation(
          {
            chatroom_id: chatroom_id,
            chatbot_name: chatbot.name,
            user_nickname: user.nickname,
            current_distance: chatroom.current_distance,
            messageConversations: messageConversations,
            quizList: quizList.map((quiz) => quiz.quiz),
          },
        );
      } catch (serviceError) {
        // 서비스에서 발생한 에러를 명시적으로 처리
        this.handleServiceError(client, serviceError, {
          chatroom_id,
          user_id,
          chatbot_id,
        });
        return;
      }

      const { score, react, improved_quiz, verification } = conversationResponse!;

      // 유저메시지 저장
      await this.messageService.createMessage(
        chatroom_id,
        message,
        SenderType.USER,
        chatbot_id,
        user_id,
      );

      if (turn_count > 0) {
        // 퀴즈 업데이트
        await this.quizService.updateQuiz({
          chatroomId: chatroom_id,
          targetSequence: CHATBOT_TURN_COUNT - turn_count + 1,
          improvedQuiz: improved_quiz!,
        });

        // 챗봇리액션 메시지 저장
        await this.messageService.createMessage(
          chatroom_id,
          react,
          SenderType.BOT,
          chatbot_id,
          user_id,
        );
        // 새로운 퀴즈 메시지 저장
        await this.messageService.createMessage(
          chatroom_id,
          improved_quiz,
          SenderType.BOT,
          chatbot_id,
          user_id,
        );
      }

      // 리액션 평가 - score평가, score평가 이후에 current_distance, heart_life 업데이트..
      await this.chatroomService.updateDistanceWithChatbot(chatroom_id, score);

      // 챗봇리액션
      const reactionMessage = chatroom.turn_count === 0 ? LAST_FIXED_MESSAGE(user.nickname) : react;
      const response = {
        status: OK,
        data: {
          chatroom_id: chatroom_id,
          chatbot_id: chatbot_id,
          chatbot_name: chatbot.name,
          message: reactionMessage,
          user_id: user_id,
          user_nickname: user.nickname,
          sender_type: SenderType.BOT,
          score: score, // 리액션 점수:  1, 0
          chatbot_profile_image: `${S3_URL}/chatbots/${chatbot_id}/profile.png`,
          reaction_image:
            turn_count === 0
              ? null
              : score === 1
                ? `${S3_URL}/chatbots/${chatbot_id}/reactions/positive.png`
                : `${S3_URL}/chatbots/${chatbot_id}/reactions/negative.png`,
          heart_life: heart_life,
          current_distance: current_distance,
          turn_count: turn_count,
        },
      };

      // 'answer' 이벤트를 수신하여 응답을 한다.
      client.emit('answer', response);

      this.logger.log(`current_distance: ${chatroom.current_distance}`);
      this.logger.log(`heart_life: ${chatroom.heart_life}`);
      if (turn_count > 0) {
        // 'quiz' 이벤트를 발행하여 질문 메시지를 전송한다.
        client.emit('quiz', {
          status: OK,
          data: {
            chatbot_id: chatbot_id,
            chatbot_name: chatbot.name,
            message: improved_quiz,
            user_id: user_id,
            user_nickname: user.nickname,
            sender_type: SenderType.BOT,
            chatroom_id: chatroom_id,
          },
        });

        this.logger.log(`improved_quiz: ${improved_quiz}`);
      } else {
        // 마지막인경우는 소켓을 종료함으로써 채팅대화를 종료한다.
        this.logger.log('5번 턴 대화 끝 종료');
        client.disconnect();
      }
    } catch (error) {
      this.handleGatewayError(client, error, request);

      if (error instanceof InAppropriateUserMessageException) {
        // 부적절한 메시지 키워드 감지할 경우 -> 'policy_error' 이벤트를 발행하여 웹소켓으로 전송...
        client.emit('policy_error', {
          status: POLICY_ERROR,
          message: error.message,
        });
      }
      if (error instanceof MessageLengthOverMaximumException) {
        // 입력한 메시지의 글자수가 초과한 경우 -> 'policy_error' 이벤트를 발행하여 웹소켓으로 전송...
        client.emit('policy_error', {
          status: POLICY_ERROR,
          message: error.message,
        });
      }

      this.logger.error('error');
      if (error instanceof BaseCustomException) {
        throw error;
      }

      // 그 이외의 문제발생은 UI 에러로 핸들링한다.
      throw new InternalServiceErrorException('예상외의 에러가 발생했습니다.', { ...error });
    }
  }

  /** 부적절한 메시지 검증 */
  private checkInvalidKeywords(message: string): void {
    const result = INVALID_MESSAGE_KEYWORDS.some((keyword) => message.includes(keyword));
    if (result === true)
      throw new InAppropriateUserMessageException('메시지에 부적절한 키워드가 감지되었어요');
  }

  // 서비스에서 발생한 에러
  private handleServiceError(
    client: Socket,
    error: any,
    context: { chatroom_id: string; user_id: string; chatbot_id: number },
  ) {
    this.logger.error(`🚨 Service Error in chatroom (chatroom_id: ${context.chatroom_id})`, {
      error: error.message,
      stack: error.stack,
      context,
    });

    if (error instanceof InAppropriateUserMessageException) {
      this.logger.warn(`부적절한 에러가 감지되었어요. (chatroom_id: ${context.chatroom_id})`);
      client.emit('policy_error', {
        status: 'POLICY_ERROR',
        message: error.message || '부적절한 메시지가 감지되었습니다.',
        error_code: 'INAPPROPRIATE_MESSAGE',
      });
      return;
    }
    if (error instanceof MessageLengthOverMaximumException) {
      this.logger.warn(`메시지 길이가 초과되었어요. (chatroom_id: ${context.chatroom_id})`);
      client.emit('policy_error', {
        status: 'POLICY_ERROR',
        message: error.message || '메시지 길이는 최대 60자 입니다.',
        error_code: 'MESSAGE_TOO_LONG',
      });
      return;
    }
    if (error instanceof InternalServiceErrorException) {
      this.logger.error(
        `External API Error in chatroom (chatroom_id: ${context.chatroom_id})`,
        error,
      );
      client.emit('error', {
        status: 'SERVICE_ERROR',
        message: 'AI 서버와의 통신에 실패했습니다. 잠시후 다시 시도해주세요',
        error_code: 'EXTERNAL_API_FAILED',
        retryable: true,
      });
      return;
    }
    this.logger.error(`❌ Unexpected Error in chatroom (chatroom_id: ${context.chatroom_id})`, {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    client.emit('error', {
      status: 'SERVICE_ERROR',
      message: '예상치 못한 오류가 발생했습니다.',
      error_code: 'UNEXPECTED_ERROR',
      retryable: false,
    });
  }
  // 게이트웨이 레벨 에러 핸들러
  private handleGatewayError(client: Socket, error: any, request: AnswerRequest) {
    this.logger.error(`🔴 Gateway Error:`, {
      error: error.message,
      stack: error.stack,
      request: {
        chatroom_id: request.chatroom_id,
        user_id: request.user_id,
        message_length: request.message?.length,
      },
    });

    if (error instanceof ResourceNotFoundException) {
      client.emit('service_error', {
        status: 'SERVICE_ERROR',
        message: error.message,
        error_code: 'RESOURCE_NOT_FOUND',
        retryable: false,
      });
      return;
    }

    // 기타 게이트웨이 에러
    client.emit('service_error', {
      status: 'SERVICE_ERROR',
      message: '서버에서 오류가 발생했습니다.',
      error_code: 'GATEWAY_ERROR',
      retryable: true,
    });
  }
}
