import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from './user.repository.interface';
import { CreateUserInfo } from './create-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}
  // 유저생성
  // 유저닉네임, 챗봇아이디
  async createUser(userNickname: string): Promise<CreateUserInfo> {
    const user = await this.userRepository.createUser(userNickname);
    return {
      id: user.id,
      nickname: user.nickname,
    };
  }

  // 단일 유저조회
  async getOneUser(userId: string) {
    return await this.userRepository.getOneUserById(userId);
  }
}
