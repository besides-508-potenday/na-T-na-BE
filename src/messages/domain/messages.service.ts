import { Inject, Injectable } from '@nestjs/common';
import { IMessageRepository } from './message.repository.interface';
import { ChatMessage, SenderType } from '@prisma/client';
import Message from './message.type';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
  ) {}

  async createMessage(
    chatroomId: string,
    content: string,
    senderType: SenderType,
    chatbotId: number,
    userId: string,
  ): Promise<ChatMessage> {
    return await this.messageRepository.saveMessage({
      chatroom_id: chatroomId,
      content: content,
      sender_type: senderType,
      chatbot_id: chatbotId,
      user_id: userId,
    });
  }

  async getMessagesByChatroomId(chatroomId: string): Promise<Message[]> {
    return await this.messageRepository.getMessagesByChatroomId(chatroomId);
  }

  async getUserMessages(chatroomId: string, userId: string): Promise<Message[]> {
    return await this.messageRepository.getUserMessages(chatroomId, userId);
  }

  async getChatbotMessages(chatroomId: string, chatbotId: number): Promise<Message[]> {
    return await this.messageRepository.getChatbotMessages(chatroomId, chatbotId);
  }
}
