import { Chatbot } from '@prisma/client';
import ChatbotWithPersonalities from './chatbot-with-personalities.type';

export interface IChatbotRepository {
  getChatbotByChatbotId(chatroomId: string);
  // 챗봇 리스트 조회
  getChatbots(): Promise<ChatbotWithPersonalities[]>;

  // 챗봇 1개 정보 조회
  getChatbotById(id: number);
}
