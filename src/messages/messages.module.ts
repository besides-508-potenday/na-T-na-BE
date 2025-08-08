import { Module } from '@nestjs/common';
import { MessagesService } from './domain/messages.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageRepositoryImpl } from './infrastructure/message.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    MessagesService,
    {
      provide: 'IMessageRepository',
      useValue: MessageRepositoryImpl,
    },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
