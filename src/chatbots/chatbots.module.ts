import { Module } from '@nestjs/common';
import { ChatbotsService } from './domain/chatbots.service';

@Module({
  providers: [ChatbotsService],
})
export class ChatbotsModule {}
