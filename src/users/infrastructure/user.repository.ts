import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '@prisma/client';

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userNickname: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        nickname: userNickname,
      },
    });
  }

  async getOneUserById(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
