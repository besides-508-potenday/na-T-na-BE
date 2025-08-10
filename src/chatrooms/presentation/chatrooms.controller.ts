import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatroomsService } from '../domain/chatrooms.service';
import { GetLastLetterResponse } from './dto/get-last-letter.dto';
import { UsersService } from 'src/users/domain/users.service';
import { ChatbotsService } from 'src/chatbots/domain/chatbots.service';
import {
  InternalServiceErrorException,
  ResourceNotFoundException,
} from 'src/common/custom-exceptions/base-custom-exception';
import S3_URL from 'src/common/S3_URL';
import { CHATBOT_RESULT_IMAGE, RESULT_DISTANCE } from '../domain/chatroom-feedback-buisness-rule';
import { ExternalApiService } from 'src/external-api/external-api.service';
import { MessagesService } from 'src/messages/domain/messages.service';
import { SenderType } from '@prisma/client';
import { feedbackConversation } from 'src/messages/domain/message-business-rule';
import Message from 'src/messages/domain/message.type';

@ApiTags('채팅룸 API')
@Controller('chatrooms')
export class ChatroomsController {
  constructor(
    private readonly chatroomService: ChatroomsService,
    private readonly userService: UsersService,
    private readonly chatbotService: ChatbotsService,
    private readonly externalApiService: ExternalApiService,
    private readonly mesageService: MessagesService,
  ) {}
  @Get(':chatroom_id/letters')
  @ApiOperation({ summary: '마지막 편지 조회 API' })
  @ApiOkResponse({
    description:
      '챗봇이 사용자에게 작성한 마지막 편지를 리턴한다. 맨처음에는 AI서버에 거쳐서 피드백을 받는다. 이후에는 chatroom_id 만 있으면 조회가 가능하다.',
    type: GetLastLetterResponse,
  })
  async getLetter(@Param('chatroom_id') chatroomId: string) {
    // 채팅방 조회
    const chatroom = await this.chatroomService.getChatroomById(chatroomId);
    if (!chatroom) {
      throw new ResourceNotFoundException(
        '존재하지 않은 채팅방 입니다.',
        `chatroom_id: ${chatroomId}인 채팅방을 찾을 수 없습니다.`,
      );
    }

    // 유저조회
    const { user, user_id, ...userParticipants } =
      await this.userService.getUserByChatroomId(chatroomId);
    const user_nickname = user.nickname;

    // 챗봇조회
    const { chatbot, chatbot_id, ...chatbotParticipants } =
      await this.chatbotService.getChatbotByChatroomId(chatroomId);
    const chatbot_name = chatbot.name;

    // 메시지 조회
    const messages = await this.mesageService.getMessagesByChatroomId(chatroomId);
    if (messages === null || messages.length === 0) {
      throw new ResourceNotFoundException('메시지가 존재하지 않습니다.');
    }

    const originWholeConversation: Message[] = messages.map((msg) => {
      return {
        content: msg.content,
        sender_type: msg.sender_type,
      } as Message;
    });

    const feedbackConversations = feedbackConversation(originWholeConversation);

    const { is_finished } = chatroom;

    // 이미 편지지작성 종료상태
    if (is_finished) {
      return {
        chatroom_id: chatroom.id,
        is_finished: chatroom.is_finished,
        current_distance: RESULT_DISTANCE(chatroom.current_distance),
        letter: chatroom.letter,
        user_nickname: user_nickname,
        chatbot_name: chatbot_name,
        chatbot_id: chatbot!.id,
        letter_mp3: `${S3_URL}/chatrooms/results/${chatroom!.id}/letter_voide.mp3`,
        chatbot_result_image: CHATBOT_RESULT_IMAGE(chatbot_id, chatroom.heart_life),
        from_chatbot: chatroom.from_chatbot ?? `너에게 편지를 보낸.. ${chatbot_name}`,
      };
    }

    // AI서버에서 피드백요청
    // 채팅 결과를 불러온다.
    const feedbackResult = await this.externalApiService.requestFeedback({
      chatroom_id: chatroomId,
      chatbot_name: chatbot_name,
      current_distance: chatroom.current_distance,
      user_nickname: user_nickname,
      conversation: feedbackConversations,
    });

    const { feedback, last_greeting, audio_base64 } = feedbackResult;

    const from_chatbot = `${last_greeting},\n${chatbot_name}`;

    const finishedChatroom = await this.chatroomService.updateLetter({
      chatroom_id: chatroomId,
      is_finished: true,
      letter: feedback,
      from_chatbot: from_chatbot,
    });

    return {
      chatroom_id: chatroomId,
      is_finished: finishedChatroom.is_finished,
      current_distance: RESULT_DISTANCE(finishedChatroom.current_distance),
      letter: finishedChatroom.letter,
      user_nickname: user!.nickname,
      chatbot_name: chatbot!.name,
      chatbot_id: chatbot!.id,
      letter_mp3: audio_base64,
      chatbot_result_image: CHATBOT_RESULT_IMAGE(chatbot!.id, finishedChatroom.heart_life),
      from_chatbot: finishedChatroom.from_chatbot,
    };
  }
}
