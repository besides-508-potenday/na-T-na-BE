import { Inject, Injectable } from '@nestjs/common';
import { IMessageRepository } from './message.repository.interface';
import { ChatMessage, SenderType } from '@prisma/client';
import Message from './message.type';
import { ResourceNotFoundException } from 'src/common/custom-exceptions/base-custom-exception';
import { IMessageCacheStore } from './message.cache-store.interface';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
    @Inject('IMessageCacheStore') private readonly messageCacheStore: IMessageCacheStore,
  ) {}

  async createMessage(
    chatroomId: string,
    content: string,
    senderType: SenderType,
    chatbotId: number,
    userId: string,
  ): Promise<Message[]> {
    // 메시지 저장 후, 저장된 리스트를 반환
    const messages = await this.messageRepository.saveMessage({
      chatroom_id: chatroomId,
      content: content,
      sender_type: senderType,
      chatbot_id: chatbotId,
      user_id: userId,
    });
    return messages;
  }

  async getMessagesByChatroomId(chatroomId: string): Promise<Message[]> {
    // 데이터베이스에서 꺼낸다
    const messages = await this.messageRepository.getMessagesByChatroomId(chatroomId);
    if (!messages || messages.length === 0) {
      throw new ResourceNotFoundException(
        '메시지가 존재하지 않습니다.',
        `chatroom_id: ${chatroomId} 채팅방에 메시지가 존재하지 않습니다.`,
      );
    }

    return messages;
  }

  async getUserMessages(chatroomId: string): Promise<Message[]> {
    return await this.messageRepository.getUserMessages(chatroomId);
  }

  async getChatbotMessages(chatroomId: string): Promise<Message[]> {
    return await this.messageRepository.getChatbotMessages(chatroomId);
  }
}
