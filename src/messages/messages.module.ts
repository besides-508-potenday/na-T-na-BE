import { Module } from '@nestjs/common';
import { MessagesService } from './domain/messages.service';

@Module({
  providers: [MessagesService],
})
export class MessagesModule {}
