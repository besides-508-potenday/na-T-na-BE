import { Module } from '@nestjs/common';
import { ChatroomsService } from './domain/chatrooms.service';
import { ChatroomsGateway } from './presentation/chatrooms.gateway';
import { ChatroomsController } from './presentation/chatrooms.controller';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalApiModule } from '../external-api/external-api.module';
import { ChatbotsModule } from '../chatbots/chatbots.module';
import { ChatroomRepositoryImpl } from './infrastructure/chatroom.repository';

@Module({
  imports: [UsersModule, ChatbotsModule, ExternalApiModule],
  providers: [
    ChatroomsService,
    ChatroomsGateway,
    {
      provide: 'IChatroomRepository',
      useFactory: (prismaService: PrismaService) => {
        return new ChatroomRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  controllers: [ChatroomsController],
  exports: [ChatroomsService],
})
export class ChatroomsModule {}
