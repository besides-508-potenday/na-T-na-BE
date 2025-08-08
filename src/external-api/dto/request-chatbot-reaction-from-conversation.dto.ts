export class RequestChatbotReactionFromConversationCommand {
  chatbot_name: string;
  user_nickname: string;
  current_distance: number;
  quiz_list: string[];
  conversation: string[];
}

export class RequestChatbotReactionFromConversationInfo {
  react: string;
  score: number;
  improved_quiz: string;
  verification: boolean;
}
