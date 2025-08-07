import ChatbotWithPersonalities from '../infrastructure/chatbot-with-personalities.type';

export interface IChatbotRepository {
  // 챗봇 리스트 조회
  getChatbots(): Promise<ChatbotWithPersonalities[]>;

  // 챗봇 1개 정보 조회
  getChatbotById(id: number);
}
