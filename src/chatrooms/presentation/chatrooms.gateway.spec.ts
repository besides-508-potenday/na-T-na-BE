import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomsGateway } from './chatrooms.gateway';

describe('ChatroomsGateway', () => {
  let gateway: ChatroomsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatroomsGateway],
    }).compile();

    gateway = module.get<ChatroomsGateway>(ChatroomsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
