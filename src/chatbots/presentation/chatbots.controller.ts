import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ChatbotsService } from '../domain/chatbots.service';
import { SwaggerMockInterceptor } from 'src/common/swagger-mock.interceptor';

// @UseInterceptors(SwaggerMockInterceptor)
@Controller('chatbots')
export class ChatbotsController {
  constructor(private readonly chatbotService: ChatbotsService) {}

  // 챗봇 조회
  @Get()
  async getChatbots() {
    const chatbots = await this.chatbotService.getChatbots();
    return chatbots;
  }
}
