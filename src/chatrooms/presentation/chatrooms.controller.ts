import { Body, Controller, Post } from '@nestjs/common';
import { ChatroomsService } from '../domain/chatrooms.service';
import { ChatroomsGateway } from './chatrooms.gateway';

@Controller('chatrooms')
export class ChatroomsController {
  constructor(
    private readonly chatRoomService: ChatroomsService,
    private readonly chatroomsGateway: ChatroomsGateway,
  ) {}

  @Post('send')
  sendMessage(@Body() message: any) {
    this.chatRoomService.sendMessage(message);
    this.chatroomsGateway.server.emit('sendMessage', message);
    return { status: 'sent', message };
  }

  // 채팅방입장 api 콜
  @Post('join')
  joinRoom(@Body() data: any) {
    // 여기서 채팅방에 입장하는 로직을 처리합니다.
    this.chatRoomService.joinRoom(data.room);
    return { status: 'joined', room: data.room };
  }
}
