import { Module } from '@nestjs/common';
import { ChatroomsService } from './domain/chatrooms.service';

@Module({
  providers: [ChatroomsService],
})
export class ChatroomsModule {}
