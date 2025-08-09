import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { MAXIMUM_USER_NICKNAME, MINIMUM_USER_NICKNAME } from '../../../users/domain/user.policy';

export class JoinRoomRequest {
  @ApiProperty({ name: 'chatbot_id', description: '챗봇 PK', example: 1 })
  @Expose({ name: 'chatbot_id' })
  @IsNotEmpty()
  @IsNumber()
  chatbot_id: number;

  @ApiProperty({
    name: 'user_nickname',
    description: '사용자 닉네임',
    example: '테스트닉네임',
  })
  @Expose({ name: 'user_nickname' })
  @IsNotEmpty()
  @IsString()
  @Min(MINIMUM_USER_NICKNAME)
  @Max(MAXIMUM_USER_NICKNAME)
  user_nickname: string;
}
