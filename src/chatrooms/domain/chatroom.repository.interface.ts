export interface IChatroomRepository {
  updateLetter(command: {
    chatroom_id: string;
    is_finished: boolean;
    letter: string;
    from_chatbot: string;
  }): unknown;
  createChatroom();
  createChatroomParticipants(userId: string, chatbotId: number, chatroomId: string);
  findChatroomById(chatroomId: string);
  positiveChatbotReaction(chatroomId: string, currentDistance: number, currentTurnCount: number);
  negativeChatbotReaction(chatroomId: string, currentHeartLife: number, currentTurnCount: number);
  updateTurnCount(chatroomId: string, turnCount: number);
}
