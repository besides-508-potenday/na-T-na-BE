import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  InAppropriateUserMessageException,
  InternalServiceErrorException,
} from '../common/custom-exceptions/base-custom-exception';
import {
  RequestCreateSituationCommand,
  RequestCreateSituationCommandInfo,
} from './dto/request-create-situation.dto';
import {
  RequestChatbotReactionFromConversationCommand,
  RequestChatbotReactionFromConversationInfo,
} from './dto/request-chatbot-reaction-from-conversation.dto';
import { RequestFeedbackCommand, RequestFeedbackInfo } from './dto/request-feedback.dto';
import { QuizesService } from '../quizes/domain/quizes.service';
import QuizList from 'src/quizes/domain/quiz-list.type';

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly quizService: QuizesService,
  ) {}

  async requestCreateSituation(request: {
    chatroom_id: string;
    user_nickname: string;
    chatbot_name: string;
  }): Promise<RequestCreateSituationCommandInfo> {
    try {
      // (AI) [POST] /situation 요청
      // AI로부터 초기 퀴즈 리스트(퀴즈10개)를 받는다.
      const result = await firstValueFrom(
        this.httpService.post(
          `${process.env.EXTERNAL_AI_SERVER_URL}/situation`,
          {
            user_nickname: request.user_nickname,
            chatbot_name: request.chatbot_name,
            chatroom_id: request.chatroom_id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000000,
          },
        ),
      );
      const { quiz_list } = result.data;

      // 초기퀴즈리스트를 DB + Redis에 저장
      await this.quizService.initializedQuizList(request.chatroom_id, quiz_list);

      return {
        quiz_list: quiz_list,
        first_quiz: quiz_list[0],
      };
    } catch (error) {
      throw new InternalServiceErrorException(
        'AI 서버의 [POST] /situation API 호출에 실패하였습니다.',
        error,
      );
    }
  }

  /**
   * AI 서버의 "/conversation" 을 호출하여
   * @param data
   * @returns
   */
  async requestChatbotReactionFromConversation(request: {
    chatbot_name: string;
    user_nickname: string;
    current_distance: number;
    chatroom_id: string;
    messageConversations: string[];
    quizList: string[];
  }): Promise<RequestChatbotReactionFromConversationInfo> {
    try {
      // 대화 기록 리스트 조회
      // - 봇: (리액션/인사) + 퀴즈 => 메시지2개를 한개로 합쳐서 제공
      // - 유저: 유저답변
      const result = await firstValueFrom(
        this.httpService.post(
          `${process.env.EXTERNAL_AI_SERVER_URL}/conversation`,
          {
            chatbot_name: request.chatbot_name,
            user_nickname: request.user_nickname,
            current_distance: request.current_distance,
            conversation: request.messageConversations, // MessageList -> string[]
            quiz_list: request.quizList, // QuizList -> string[]
            chatroom_id: request.chatroom_id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // 부적절 컨텍스트 감지
      if (result.data?.verification == false) {
        throw new InAppropriateUserMessageException();
      }

      return {
        react: result.data?.react,
        score: result.data?.score,
        improved_quiz: result.data?.improved_quiz,
        verification: result.data?.verification,
      };
    } catch (error) {
      throw new InternalServiceErrorException(
        'AI 서버의 [POST] /conversation API 호출에 실패하였습니다.',
        error,
      );
    }
  }

  async requestFeedback(request: {
    chatroom_id: string;
    chatbot_name: string;
    user_nickname: string;
    current_distance: number;
    wholeConversation: string[];
  }): Promise<RequestFeedbackInfo> {
    try {
      // 대화기록 리스트 조회
      /**
       * [
       *    "(챗봇인사) + (퀴즈1)",
       *    "퀴즈 1 사용자 대답" ,
       *    "(리액션 1) + (변경된 퀴즈 2)",
       *    "퀴즈 2 사용자 대답",
       *     ...
       *    "(리액션 9) + (변경된 퀴즈 10)",
       *    "퀴즈 10 사용자 대답"
       * ]
       */

      const result = await firstValueFrom(
        this.httpService.post(
          `${process.env.EXTERNAL_AI_SERVER_URL}/feedback`,
          {
            chatroom_id: request.chatroom_id,
            chatbot_name: request.chatbot_name,
            user_nickname: request.user_nickname,
            current_distance: request.current_distance,
            conversation: request.wholeConversation,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return result.data;
    } catch (error) {
      throw new InternalServiceErrorException(
        'AI 서버의 [POST] /conversation API 호출에 실패하였습니다.',
        error,
      );
    }
  }
}
