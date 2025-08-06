import ChatbotWithPersonalities from '../infrastructure/chatbot-with-personalities.type';

export interface IChatbotRepository {
  // 챗봇 리스트 조회
  getChatbots(): Promise<ChatbotWithPersonalities[]>;
}
