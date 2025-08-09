import { ApiProperty } from '@nestjs/swagger';

export class GetLastLetterResponse {
  @ApiProperty({ name: 'chatroom_id', description: '채팅방 PK', example: 'test-chatroom-uuid' })
  chatroom_id: string;

  @ApiProperty({
    name: 'is_finished',
    description:
      '마지막편지 작성완료 여부(true: 마지막편지 작성완료, false: 마지막편지 작성 필요(AI의 /feedback API 호출)',
    example: false,
  })
  is_finished: boolean = false;

  @ApiProperty({
    name: 'current_distance',
    description: '챗봇과의 사이거리(0,20,40,60,80,100)',
    example: 100,
  })
  current_distance: number;

  @ApiProperty({
    name: 'letter',
    description: '챗봇이 작성해준 편지내용',
    example: '오늘 우리 대화하면서 너에게 많은 실망감을 느꼈어.',
  })
  letter: string;

  @ApiProperty({ name: 'chatbot_name', description: '챗봇 이름', example: '투닥이' })
  chatbot_name: string;

  @ApiProperty({ name: 'chatbot_id', description: '챗봇 PK', example: 1 })
  chatbot_id: number;

  @ApiProperty({
    name: 'letter',
    description: '마지막 인사문구와 챗봇이름',
    example: '내 마음의 소리를 들어줬으면 하며, \n투닥이',
  })
  from_chatbot: string;

  @ApiProperty({
    name: 'letter_mp3',
    description: '음성편지 mp3 파일',
    example: '{S3-URL}/chatrooms/results/{chatroom_id}/letter_voice.mp3',
  })
  letter_mp3: string; // mp3 S3 URL

  @ApiProperty({
    name: 'chatbot_result_image',
    description: '챗봇과의 사이거리(current_distance)값에 따라 나타내는 결과 이미지',
    example: '${S3-URL}/chatbots/{chatbot_id}/results/result_0.png',
  })
  chatbot_result_image: string; // 챗봇 결과 이미지
}
