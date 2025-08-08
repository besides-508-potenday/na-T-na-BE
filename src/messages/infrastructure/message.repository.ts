import { ChatMessage, SenderType } from '@prisma/client';
import { IMessageRepository } from '../domain/message.repository.interface';
import { PrismaService } from '../../prisma/prisma.service';
import Message from '../domain/message.type';

export class MessageRepositoryImpl implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getChatbotMessages(chatroomId: string, chatbotId: number): Promise<Message[]> {
    return await this.prisma.chatMessage.findMany({
      select: {
        content: true,
        sender_type: true,
      },
      where: {
        chatroom_id: chatroomId,
        chatbot_id: chatbotId,
        sender_type: SenderType.BOT,
      },
    });
  }
  async getUserMessages(chatroomId: string, userId: string): Promise<Message[]> {
    return await this.prisma.chatMessage.findMany({
      select: {
        content: true,
        sender_type: true,
      },
      where: {
        chatroom_id: chatroomId,
        user_id: userId,
        sender_type: SenderType.USER,
      },
    });
  }

  async getMessagesByChatroomId(chatroomId: string): Promise<Message[]> {
    return await this.prisma.chatMessage.findMany({
      select: {
        content: true,
        sender_type: true,
      },
      where: {
        chatroom_id: chatroomId,
      },
    });
  }
  async saveMessage(data: {
    chatroom_id: string;
    content: string;
    sender_type: SenderType;
    chatbot_id: number;
    user_id: string;
  }): Promise<ChatMessage> {
    return await this.prisma.chatMessage.create({
      data: { ...data },
    });
  }
}
