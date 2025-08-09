export class RequestFeedbackCommand {
  chatbot_name: string;
  user_nickname: string;
  current_distance: number;
  conversation: string[];
}
export class RequestFeedbackInfo {
  feedback: string;
  last_greeting: string;
  feedback_mp3_file: string;
}
