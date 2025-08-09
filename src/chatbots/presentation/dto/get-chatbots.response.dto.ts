import { ApiProperty } from '@nestjs/swagger';

export class GetChatbotsResponse {
  @ApiProperty({ example: 1 })
  chatbot_id: number;

  @ApiProperty({ example: '투닥이' })
  chatbot_name: string;

  @ApiProperty({ example: '공감 학습 능력기' })
  chatbot_speciality: string;

  @ApiProperty({ example: '관계 중심 정서, 소심함, 감정 과몰입, 인정 욕구' })
  chatbot_personalities: string;

  @ApiProperty({
    example: 'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/1/profile.png',
  })
  chatbot_profile_image: string;
}
