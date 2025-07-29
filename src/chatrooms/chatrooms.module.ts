import { Module } from '@nestjs/common';
import { ChatroomsService } from './domain/chatrooms.service';
import { ChatroomsGateway } from './presentation/chatrooms.gateway';
import { ChatroomsController } from './presentation/chatrooms.controller';

@Module({
  providers: [ChatroomsService, ChatroomsGateway],
  controllers: [ChatroomsController],
})
export class ChatroomsModule {}
