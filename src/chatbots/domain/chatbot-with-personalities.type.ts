type ChatbotWithPersonalities = {
  chatbot_id: number;
  chatbot_name: string;
  chatbot_speciality: string;
  is_unknown: boolean;
  chatbot_personalities: string | null;
};

export default ChatbotWithPersonalities;
