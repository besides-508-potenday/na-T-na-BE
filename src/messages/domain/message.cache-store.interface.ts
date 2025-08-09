import { ChatMessage } from '@prisma/client';
import Message from './message.type';

export const REDIS_MESSAGE_LSIT_KEY = (chatroom_id: string) => `message_list-${chatroom_id}`;
export interface IMessageCacheStore {
  saveMessageListAtCacheStore(chatroomId: string, messages: Message[]): Promise<Message[] | null>;
  getMessageListFromCacheStore(chatroomId: string): Promise<Message[] | null>;
}
