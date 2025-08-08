import { ChatMessage, SenderType } from '@prisma/client';
import Message from './message.type';

export interface IMessageRepository {
  getChatbotMessages(chatroomId: string, chatbotId: number): Promise<Message[]>;
  getUserMessages(chatroomId: string, userId: string): Promise<Message[]>;
  getMessagesByChatroomId(chatroomId: string): Promise<Message[]>;
  // 메시지 저장
  saveMessage(data: {
    chatroom_id: string;
    content: string;
    sender_type: SenderType;
    chatbot_id: number;
    user_id: string;
  }): Promise<ChatMessage>;
}
