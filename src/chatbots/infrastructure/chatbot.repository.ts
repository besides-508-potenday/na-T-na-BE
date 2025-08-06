import { Injectable } from '@nestjs/common';
import { IChatbotRepository } from '../domain/chatbot.repository.interface';
import ChatbotWithPersonalities from './chatbot-with-personalities.type';
import { PrismaService } from 'src/prisma/prisma.service';

export class ChatbotRepositoryImpl implements IChatbotRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getChatbots(): Promise<ChatbotWithPersonalities[]> {
    const chatbots = await this.prismaService.chatbot.findMany({
      select: {
        id: true,
        name: true,
        speciality: true,
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
      chatbot_personalities: chatbot.personalities
        .map((cp) => cp.personality.name ?? '')
        .filter((name) => !!name)
        .join(', '),
    }));
  }
}
