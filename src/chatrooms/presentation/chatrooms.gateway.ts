import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatroomsService } from '../domain/chatrooms.service';

// 클라이언트 패킷들이 게이트웨이를 통해서 들어온다.
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatroomsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private connectedClients: Socket[] = [];
  private userName = 'system';
  private socketId = '';

  // 웹소켓 서버 정의
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatroomsService: ChatroomsService) {}

  // 채팅방 입장
  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // 유저생성
    if (data) {
      this.userName = data;
    }

    this.socketId = client.id;
    const user = {
      id: this.socketId,
      name: this.userName,
      online: true,
    };
    client.emit('join_room', { status: 'ok', data: user });
  }

  // 메시지 전송
  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
    payload: any,
  ) {
    // 유저조회
    const user = {
      id: {
        type: this.socketId,
        ref: 'User',
      },
      name: this.userName,
    };
    const newMessage = {
      chat: data,
      user: user,
    };
    // message 전송
    client.emit('message', newMessage);
  }

  // 소켓연결
  handleConnection(client: Socket) {
    const socketId = client.id;
    this.addClient(socketId);
  }
  // 소켓 연결 해제
  handleDisconnect(client: Socket) {
    const socketId = client.id;
    this.removeClient(socketId);
  }

  // 클라이언트 연결 추가
  addClient(client: any) {
    this.connectedClients.push(client);
  }

  // 클라이언트 소켓 연결 제거
  removeClient(client: any) {
    const index = this.connectedClients.indexOf(client);
    if (index !== -1) {
      this.connectedClients.splice(index, 1);
    }
  }
}
