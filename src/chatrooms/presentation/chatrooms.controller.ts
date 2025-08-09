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
import { S3 } from '@aws-sdk/client-s3';

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
    const chatroom = await this.chatroomService.getChatroomById(chatroomId);
    if (!chatroom) {
      throw new ResourceNotFoundException(
        '존재하지 않은 채팅방 입니다.',
        `chatroom_id: ${chatroomId}인 채팅방을 찾을 수 없습니다.`,
      );
    }
    const { is_finished, chatbot, user, message, quiz } = chatroom;

    // 이미 편지지작성 종료상태
    if (is_finished) {
      return {
        chatroom_id: chatroom.id,
        is_finished: chatroom.is_finished,
        current_distance: RESULT_DISTANCE(chatroom.current_distance),
        letter: chatroom.letter,
        user_nickname: chatroom.user!.user_nickname,
        chatbot_name: chatroom.chatbot!.name,
        chatbot_id: chatroom.chatbot!.id,
        letter_mp3: `${S3_URL}/chatrooms/results/${chatroom.chatbot!.id}/letter_voide.mp3`,
        chatbot_result_image: CHATBOT_RESULT_IMAGE(chatroom.chatbot!.id, chatroom.heart_life),
        from_chatbot: chatroom.from_chatbot,
      };
    }

    // AI서버에서 피드백요청
    // 메시지 리스트
    const messages = await this.mesageService.getMessagesByChatroomId(chatroomId);

    const { feedback, last_greeting, feedback_mp3_file } =
      await this.externalApiService.requestFeedback({
        chatroom_id: chatroomId,
        chatbot_name: chatbot.name,
        current_distance: chatroom.current_distance,
        user_nickname: user.nickname,
        wholeConversation: feedbackConversation(messages),
      });

    // feedback_mp3_file 은 base64인코딩된 파일이다.
    const s3 = new S3({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    try {
      const base64String: string = feedback_mp3_file; // Assuming feedback_mp3_file contains the base64 string
      const cleanBase64 = base64String.replace(/^data:audio\/[a-z]+;base64,/, '');
      const mp3File: Buffer = Buffer.from(cleanBase64, 'base64');

      // 파일 받고, base64로 디코딩해서 S3에 저장
      await s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `chatrooms/results/${chatroomId}/letter_voice.mp3`,
        Body: mp3File,
        ContentType: 'audio/mpeg',
        ACL: 'public-read',
      });
    } catch (error) {
      throw new InternalServiceErrorException('base64 인코딩을 실패하였습니다.', error);
    }

    const from_chatbot = `${last_greeting},\n${chatbot.name}`;

    const finishedChatroom = await this.chatroomService.updateLetter({
      chatroom_id: chatroomId,
      is_finished: true,
      letter: feedback,
      from_chatbot: from_chatbot,
    });

    return {
      chatroom_id: finishedChatroom.id,
      is_finished: finishedChatroom.is_finished,
      current_distance: RESULT_DISTANCE(finishedChatroom.current_distance),
      letter: finishedChatroom.letter,
      user_nickname: finishedChatroom.user!.user_nickname,
      chatbot_name: finishedChatroom.chatbot!.name,
      chatbot_id: finishedChatroom.chatbot!.id,
      letter_mp3: `${S3_URL}/chatrooms/results/${finishedChatroom.chatbot!.id}/letter_voide.mp3`,
      chatbot_result_image: CHATBOT_RESULT_IMAGE(
        finishedChatroom.chatbot!.id,
        finishedChatroom.heart_life,
      ),
      from_chatbot: finishedChatroom.from_chatbot,
    };
  }
}
