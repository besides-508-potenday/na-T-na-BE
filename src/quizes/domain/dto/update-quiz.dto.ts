export class UpdateQuizCommand {
  chatroomId: string; // 채팅방 PK
  targetSequence: number; // 변경해야될 순서
  improvedQuiz: string; // 개선된 퀴즈
}
