import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ChatbotsService } from '../domain/chatbots.service';
import { SwaggerMockInterceptor } from '../../common/swagger-mock.interceptor';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { GetChatbotsResponse } from './dto/get-chatbots.response.dto';

@ApiTags('챗봇 API')
@Controller('chatbots')
// @UseInterceptors(SwaggerMockInterceptor)
export class ChatbotsController {
  constructor(private readonly chatbotService: ChatbotsService) {}

  // 챗봇 조회
  @Get()
  @ApiOperation({ summary: '챗봇 리스트 조회 API' })
  @ApiProperty({
    description: '챗봇 리스트 조회',
  })
  @ApiOkResponse({
    description: '챗봇 리스트를 리턴한다.',
    type: GetChatbotsResponse,
    isArray: true,
  })
  async getChatbots() {
    const chatbots = await this.chatbotService.getChatbots();
    return chatbots;
  }
}
