import { Inject, Injectable } from '@nestjs/common';
import { IChatroomRepository } from './chatroom.repository.interface';
import {
  BadRequestException,
  ResourceNotFoundException,
} from '../../common/custom-exceptions/base-custom-exception';

@Injectable()
export class ChatroomsService {
  constructor(
    @Inject('IChatroomRepository') private readonly chatroomRepository: IChatroomRepository,
  ) {}

  async getChatroomById(chatroomId: string) {
    return await this.chatroomRepository.findChatroomById(chatroomId);
  }

  async createChatroom(userId: string, chatbotId: number) {
    // 채팅방 insert
    const chatroom = await this.chatroomRepository.createChatroom();
    const chatroomId = chatroom.id;

    // 유저+채팅방+챗봇 연결테이블에 데이터로우 생성
    await this.chatroomRepository.createChatroomParticipants(userId, chatbotId, chatroomId);
    return chatroom;
  }

  /**
   * 부정적인 반응일경우 (score = 0)
   * - current_distance: 그대로 유지
   * - heart_life: 1씩 감소
   *
   * 긍정적인 반응일경우 (score = 1)
   * - current_distance: 1씩 감소
   * - heart_life: 그대로 유지
   *
   * 공통
   * - turn_count: 1씩감소
   */
  async updateDistanceWithChatbot(chatroomId: string, score: number) {
    const chatroom = await this.chatroomRepository.findChatroomById(chatroomId);
    if (!chatroom) {
      throw new ResourceNotFoundException(
        '채팅방이 존재하지 않습니다.',
        `chatroom_id=${chatroomId} 인 채팅방이 존재하지 않음`,
      );
    }

    switch (score) {
      case 0: // 부정적인 평가
        return await this.chatroomRepository.negativeChatbotReaction(
          chatroomId,
          chatroom.heart_life,
          chatroom.turn_count,
        );
      case 1: // 긍정적인 평가
        return await this.chatroomRepository.positiveChatbotReaction(
          chatroomId,
          chatroom.current_distance,
          chatroom.turn_count,
        );
      default:
        throw new BadRequestException(
          '잘못된 요청입니다.',
          '숫자 0과 1 이외는 score가 될 수 없습니다.',
        );
    }
  }

  /** 턴횟수 업데이트 */
  async updateChatTurnCounts(chatroomId: string) {
    const chatroom = await this.chatroomRepository.findChatroomById(chatroomId);
    if (!chatroom) {
      throw new ResourceNotFoundException(
        '채팅방이 존재하지 않습니다.',
        `chatroom_id=${chatroomId} 인 채팅방이 존재하지 않음`,
      );
    }
    await this.chatroomRepository.updateTurnCount(chatroomId, chatroom.turn_count);
  }

  /** 마지막 편지 관련 정보 저장
   * - is_finished: false -> true
   * - letter 값 넣어서 변경
   * - from_chatbot: null -> 값넣기
   * */
  async updateLetter(command: {
    chatroom_id: string;
    is_finished: boolean;
    letter: string;
    from_chatbot: string;
  }) {
    await this.chatroomRepository.updateLetter({
      ...command,
    });

    return this.getChatroomById(command.chatroom_id);
  }
}
