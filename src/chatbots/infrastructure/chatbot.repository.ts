import { IChatbotRepository } from '../domain/chatbot.repository.interface';
import { PrismaService } from '../../prisma/prisma.service';

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

  async getChatbots() {
    const chatbots = await this.prisma.chatbot.findMany({
      select: {
        id: true,
        name: true,
        is_unknown: true,
        speciality: true,
        personality: true,
      },
    });

    // personality name만 추출하여 평탄화 시킨다.
    return chatbots.map((chatbot) => ({
      chatbot_id: chatbot.id,
      chatbot_name: chatbot.name,
      is_unknown: chatbot.is_unknown,
      chatbot_speciality: chatbot.speciality,
      chatbot_personality: chatbot.personality,
    }));
  }
}
