import { ChatMessage, SenderType } from '@prisma/client';
import { IMessageRepository } from '../domain/message.repository.interface';
import { PrismaService } from '../../prisma/prisma.service';
import Message from '../domain/message.type';

export class MessageRepositoryImpl implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getChatbotMessages(chatroomId: string): Promise<Message[]> {
    return await this.prisma.chatMessage.findMany({
      select: {
        content: true,
        sender_type: true,
      },
      where: {
        chatroom_id: chatroomId,
        sender_type: SenderType.BOT,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
  async getUserMessages(chatroomId: string): Promise<Message[]> {
    return await this.prisma.chatMessage.findMany({
      select: {
        content: true,
        sender_type: true,
      },
      where: {
        chatroom_id: chatroomId,
        sender_type: SenderType.USER,
      },
      orderBy: {
        createdAt: 'asc',
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
  async saveMessage(data: {
    chatroom_id: string;
    content: string;
    sender_type: SenderType;
    chatbot_id: number;
    user_id: string;
  }): Promise<Message[]> {
    // 메시지 추가
    await this.prisma.chatMessage.create({
      data: { ...data },
    });

    // 추가후
    return this.getChatbotMessages(data.chatroom_id);
  }
}
