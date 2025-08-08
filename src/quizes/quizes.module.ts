import { Module } from '@nestjs/common';
import { QuizesService } from './domain/quizes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizRepositoryImpl } from './infrastructure/quiz.repository';

@Module({
  providers: [
    QuizesService,
    {
      provide: 'IQuizRepository',
      useFactory: (prismaService: PrismaService) => {
        return new QuizRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
  ],
})
export class QuizesModule {}
