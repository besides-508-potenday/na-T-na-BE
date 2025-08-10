import { PrismaService } from '../../prisma/prisma.service';
import { CHATBOT_TURN_COUNT } from '../domain/chatroom-feedback-buisness-rule';
import { IChatroomRepository } from '../domain/chatroom.repository.interface';

export class ChatroomRepositoryImpl implements IChatroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 마지막편지 업데이트 */
  async updateLetter(command: {
    chatroom_id: string;
    is_finished: boolean;
    letter: string;
    from_chatbot: string;
  }): Promise<unknown> {
    return await this.prisma.chatroom.update({
      where: {
        id: command.chatroom_id,
      },
      data: {
        letter: command.letter,
        from_chatbot: command.from_chatbot,
        is_finished: command.is_finished,
      },
    });
  }

  /**
   * turn_count 가 0보다 클 경우에 turn_count 를 감소시킨다.
   */
  async updateTurnCount(chatroomId: string, turnCount: number) {
    return await this.prisma.chatroom.update({
      where: {
        id: chatroomId,
        turn_count: { gt: 0 },
      },
      data: {
        turn_count: { decrement: 1 },
      },
    });
  }

  async negativeChatbotReaction(
    chatroomId: string,
    currentHeartLife: number,
    currentTurnCount: number,
  ) {
    return await this.prisma.chatroom.update({
      where: {
        id: chatroomId,
      },
      data: {
        heart_life: currentHeartLife > 0 ? { decrement: 1 } : currentHeartLife, // 하트 1씩 감소
        turn_count: currentTurnCount > 0 ? { decrement: 1 } : currentTurnCount, // 턴카운트 1씩감소
      },
    });
  }
  async positiveChatbotReaction(
    chatroomId: string,
    currentDistance: number,
    currentTurnCount: number,
  ) {
    return await this.prisma.chatroom.update({
      where: {
        id: chatroomId,
      },
      data: {
        current_distance: currentDistance - 1, // 현재 챗봇과의 거리 1씩 감소
        turn_count: currentTurnCount - 1, // 턴카운트 감소
      },
    });
  }

  async findChatroomById(chatroomId: string) {
    return await this.prisma.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });
  }

  async createChatroom() {
    return await this.prisma.chatroom.create({
      data: {
        letter: 'INITIAL_LETTER',
        is_finished: false,
        heart_life: CHATBOT_TURN_COUNT,
        turn_count: CHATBOT_TURN_COUNT,
        current_distance: CHATBOT_TURN_COUNT,
      },
    });
  }

  async createChatroomParticipants(userId: string, chatbotId: number, chatroomId: string) {
    return await this.prisma.chatroomParticipant.create({
      data: {
        user_id: userId,
        chatbot_id: chatbotId,
        chatroom_id: chatroomId,
      },
    });
  }
}
