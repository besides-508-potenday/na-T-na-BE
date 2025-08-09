import { SenderType } from '@prisma/client';
import Message from './message.type';
import { CHATBOT_TURN_COUNT } from 'src/chatrooms/domain/chatroom-feedback-buisness-rule';

export const MAXIMUM_MESSAGE_LENGTH = 60;

export const INITIAL_GREETING_FIXED_MESSAGE = (userNickname: string) =>
  `저기.. ${userNickname}..! 잘지냈어? 혹시 내가 할말이 있는데 들어줄래?`;

export const LAST_FIXED_MESSAGE = (userNickname: string) =>
  `오늘 너랑 얘기해서 정말 즐거웠어. ${userNickname}! 저기... 사실 너에게 하고 싶은 말이 있어서... 편지로 써봤는데, 혹시 받아줄래? 👉👈`;

export const INVALID_MESSAGE_KEYWORDS: string[] = [
  '죽음',
  '자살',
  '폭력',
  '학대',
  '중증',
  '우울증',
  '트라우마',
];

/**
 * sender_type: BOT 인 대화 2개는 한문장으로 합치고
 * sender_type: USER 인 대화는 그대로.
 */
export const convertConversation = (messages: Message[], user_answer: string) => {
  const result: string[] = [];
  let currentBotMessage: string[] = [];
  for (const message of messages) {
    if (message.sender_type === SenderType.BOT) {
      currentBotMessage.push(message.content);
    } else {
      if (currentBotMessage.length > 0) {
        result.push(currentBotMessage.join(' '));
        currentBotMessage = [];
      }
      result.push(message.content);
    }
  }

  // 마지막에 누적된 bot 메시지들이 있으면 처리
  if (currentBotMessage.length > 0) result.push(currentBotMessage.join(' '));

  // 새로운 user_answer 추가
  if (result.length + 1 < CHATBOT_TURN_COUNT * 2) {
    result.push(user_answer);
  }
  return result;
};

export const feedbackConversation = (messages: Message[]) => {
  const result: string[] = [];
  let currentBotMessage: string[] = [];
  for (const message of messages) {
    if (message.sender_type === SenderType.BOT) {
      currentBotMessage.push(message.content);
    } else {
      if (currentBotMessage.length > 0) {
        result.push(currentBotMessage.join(' '));
        currentBotMessage = [];
      }
      result.push(message.content);
    }
  }

  // 마지막에 누적된 bot 메시지들이 있으면 처리
  if (currentBotMessage.length > 0) result.push(currentBotMessage.join(' '));

  return result;
};
