import { Module } from '@nestjs/common';
import { ChatbotsService } from './domain/chatbots.service';
import { ChatbotsController } from './presentation/chatbots.controller';
import { ChatbotRepositoryImpl } from './infrastructure/chatbot.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ChatbotsService,
    {
      provide: 'IChatbotRepository',
      useFactory: (prismaService: PrismaService) => {
        return new ChatbotRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  controllers: [ChatbotsController],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
