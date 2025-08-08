import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { HttpModule } from '@nestjs/axios';
import { QuizesModule } from '../quizes/quizes.module';

@Module({
  imports: [HttpModule, QuizesModule],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}
