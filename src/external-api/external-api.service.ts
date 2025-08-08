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

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  async requestCreateSituation(request: {
    chatroom_id: string;
    user_nickname: string;
    chatbot_name: string;
  }): Promise<RequestCreateSituationCommandInfo> {
    try {
      // AI로부터 초기 퀴즈 리스트 받는다.
      const result = await firstValueFrom(
        this.httpService.post(
          `${process.env.EXTERNAL_AI_SERVER_URL}/situation`,
          {
            user_nickname: request.user_nickname,
            chatbot_name: request.chatbot_name,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 1000000,
          },
        ),
      );
      const { quiz_list } = result.data;
      // 초기퀴즈리스트를 DB + Redis에 저장
      // 첫번째 퀴즈를 리턴

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
  async requestChatbotReactionFromConversation(request: {}): Promise<RequestChatbotReactionFromConversationInfo> {
    try {
      // 대화 기록 리스트 조회
      // - 봇: (리액션/인사) + 퀴즈 => 메시지2개를 한개로 합쳐서 제공
      // - 유저: 유저답변
      const result = await firstValueFrom(
        this.httpService.post(
          `${process.env.EXTERNAL_AI_SERVER_URL}/conversation`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 1000000,
          },
        ),
      );

      // 부적절 컨텍스트 감지
      if (result.data?.verification == false) {
        throw new InAppropriateUserMessageException();
      }
      return result.data;
    } catch (error) {
      throw new InternalServiceErrorException(
        'AI 서버의 [POST] /conversation API 호출에 실패하였습니다.',
        error,
      );
    }
  }

  async requestFeedback(request: {
    chatbot_name: string;
    user_nickname: string;
    current_distance: number;
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
            chatbot_name: request.chatbot_name,
            user_nickname: request.user_nickname,
            current_distance: request.current_distance,
            conversation: [],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 1000000,
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
