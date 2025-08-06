import { Inject, Injectable } from '@nestjs/common';
import { IChatbotRepository } from './chatbot.repository.interface';
import S3_URL from '../../common/S3_URL';

@Injectable()
export class ChatbotsService {
  constructor(
    @Inject('IChatbotRepository') private readonly chatbotRepository: IChatbotRepository,
  ) {}

  async getChatbots() {
    const chatbots = await this.chatbotRepository.getChatbots();
    return chatbots.map((chatbot) => ({
      ...chatbot,
      chatbot_profile_image: `${S3_URL}/chatbots/${chatbot.chatbot_id}/profile.png`,
    }));
  }
}
