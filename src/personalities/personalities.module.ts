import { Module } from '@nestjs/common';
import { PersonalitiesService } from './domain/personalities.service';

@Module({
  providers: [PersonalitiesService],
})
export class PersonalitiesModule {}
