import { Module } from '@nestjs/common';
import { QuizesService } from './domain/quizes.service';

@Module({
  providers: [QuizesService],
})
export class QuizesModule {}
