import { ApiProperty } from '@nestjs/swagger';
import { SenderType } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class AnswerRequest {
  @ApiProperty({ name: 'chatbot_id', description: '챗봇 PK', example: 1 })
  @Expose({ name: 'chatbot_id' })
  @IsNotEmpty()
  @IsNumber()
  chatbot_id: number;

  @ApiProperty({
    name: 'message',
    description: '메시지',
    example: '안녕? 나는 투닥이야~ 만나서 반가워',
  })
  @Expose({ name: 'message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ name: 'chatroom_id', description: '채팅방 PK', example: 'test-chatroom-uuid' })
  @Expose({ name: 'chatroom_id' })
  @IsNotEmpty()
  @IsUUID()
  chatroom_id: string;

  @ApiProperty({ name: 'user_id', description: '유저 PK', example: 'test-user-uuid' })
  @Expose({ name: 'user_id' })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    name: 'sender_type',
    description: '전송자 주체 (USER: 사용자, BOT: 챗봇)',
    example: 'BOT',
    enum: SenderType,
  })
  @Expose({ name: 'sender_type' })
  @IsNotEmpty()
  @IsEnum(SenderType)
  sender_type: SenderType;
}
