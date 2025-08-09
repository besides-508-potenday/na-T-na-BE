import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users.controller';
import { UsersService } from './domain/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepositoryImpl } from './infrastructure/user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useFactory: (prismaService: PrismaService) => {
        return new UserRepositoryImpl(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
