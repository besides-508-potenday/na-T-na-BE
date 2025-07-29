import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatroomsService {
  // 채팅방 입장 로직
  joinRoom(room: string) {
    throw new Error('Method not implemented.');
  }

  // 채팅방에 메시지 전송
  sendMessage(message: any): string {
    // Logic to handle sending a message
    return `투닥이: ${message} `;
  }
}
