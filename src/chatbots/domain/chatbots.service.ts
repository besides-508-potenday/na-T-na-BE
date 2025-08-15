import { Inject, Injectable } from '@nestjs/common';
import { IChatbotRepository } from './chatbot.repository.interface';
import S3_URL from '../../common/S3_URL';

@Injectable()
export class ChatbotsService {
  constructor(
    @Inject('IChatbotRepository') private readonly chatbotRepository: IChatbotRepository,
  ) {}

  /**
   * 챗봇리스트 검색
   */
  async getChatbots() {
    const chatbots = await this.chatbotRepository.getChatbots();
    return chatbots.map((chatbot) => ({
      ...chatbot,
      chatbot_profile_image: chatbot.is_unknown
        ? `${S3_URL}/chatbots/${chatbot.chatbot_id}/unknown.png`
        : `${S3_URL}/chatbots/${chatbot.chatbot_id}/profile.png`,
    }));
  }

  /**
   * 챗봇 1개 조회
   */
  async getChatbot(id: number) {
    const chatbot = await this.chatbotRepository.getChatbotById(id);
    return chatbot;
  }

  /** 채팅방 고유식별자로(chatroom_id)로 챗봇조회하기 */
  async getChatbotByChatroomId(chatroomId: string) {
    const chatbot = await this.chatbotRepository.getChatbotByChatroomId(chatroomId);
    return chatbot;
  }
}
