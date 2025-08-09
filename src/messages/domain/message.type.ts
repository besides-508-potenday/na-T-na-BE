import { SenderType } from '@prisma/client';

type Message = {
  content: string;
  sender_type: SenderType;
};

export default Message;
