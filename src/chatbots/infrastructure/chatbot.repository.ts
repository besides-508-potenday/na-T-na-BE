import { Injectable } from '@nestjs/common';
import { IChatbotRepository } from '../domain/chatbot.repository.interface';
import ChatbotWithPersonalities from './chatbot-with-personalities.type';
import { PrismaService } from 'src/prisma/prisma.service';

export class ChatbotRepositoryImpl implements IChatbotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getChatbotById(id: number) {
    const chatbot = await this.prisma.chatbot.findUnique({
      select: {
        id: true,
        name: true,
      },
      where: {
        id: id,
      },
    });
    return chatbot;
  }

  async getChatbots(): Promise<ChatbotWithPersonalities[]> {
    const chatbots = await this.prisma.chatbot.findMany({
      select: {
        id: true,
        name: true,
        speciality: true,
        is_unknown: true,
        personalities: {
          select: {
            personality: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // personality name만 추출하여 평탄화 시킨다.
    return chatbots.map((chatbot) => ({
      chatbot_id: chatbot.id,
      chatbot_name: chatbot.name,
      chatbot_speciality: chatbot.speciality,
      is_unknown: chatbot.is_unknown,
      chatbot_personalities: chatbot.is_unknown
        ? chatbot.personalities.map((cp) => cp.personality.name).join(',')
        : null,
    }));
  }
}
