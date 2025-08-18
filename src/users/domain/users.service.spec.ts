import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

const mockUserRepositoryImpl = {
  createUser: jest.fn(),
  getOneUserById: jest.fn(),
  getUserByChatroomId: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: typeof mockUserRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: 'IUserRepository', useValue: mockUserRepositoryImpl }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<typeof mockUserRepositoryImpl>('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByChatroomId', () => {
    it('채팅룸 식별자로 참여한 유저조회에 성공한다', async () => {
      // arrange
      const chatroomId = 'existed-chatroom-uuid';
      const mockResult = {
        user: {
          id: 'example-user-uuid',
          nickname: '테스트',
        },
        id: 'chatroom-participant-uuid',
        chatroom_id: chatroomId,
        user_id: 'example-user-uuid',
        chatbot_id: 1,
      };
      userRepository.getUserByChatroomId.mockReturnValue(mockResult);

      // act
      const result = await service.getUserByChatroomId(chatroomId);

      // assert
      expect(result.user).toBeDefined();
      expect(result.user.nickname).toEqual('테스트');
      expect(result.chatroom_id).toEqual(chatroomId);
      expect(userRepository.getUserByChatroomId).toHaveBeenCalledWith(chatroomId);
    });
    it('채팅룸 식별자로 유저를 조회할 수 없으면 null을 리턴한다', async () => {
      // arrange
      const chatroomId = 'not-existed-chatroom-uuid';
      userRepository.getUserByChatroomId.mockReturnValue(null);

      // act
      const result = await service.getUserByChatroomId(chatroomId);

      // assert
      expect(result).toBeNull();
      expect(userRepository.getUserByChatroomId).toHaveBeenCalledWith(chatroomId);
    });
  });
  describe('createUser', () => {
    it('신규 유저 생성을 성공한다', async () => {
      // arrange
      const nickname = '나티나';
      const mockUser = { id: 'test-uuid', nickname: nickname };
      userRepository.createUser.mockReturnValue(mockUser);

      // act
      const result = await service.createUser(nickname);

      // assert
      expect(result.id).toEqual('test-uuid');
      expect(result.nickname).toEqual(nickname);
      expect(userRepository.createUser).toHaveBeenCalledWith(nickname);
    });
  });

  describe('getUserById', () => {
    it('유저의 고유식별자로 단일 유저를 조회에 성공한다', async () => {
      // arrange
      const id = 'test-uuid';
      const mockUser = { id: 'test-uuid', nickname: '나티나' };
      userRepository.getOneUserById.mockReturnValue(mockUser);

      // act
      const result = await service.getOneUser(id);

      // assert
      expect(result.id).toEqual(id);
      expect(result.nickname).toEqual('나티나');
      expect(userRepository.getOneUserById).toHaveBeenCalledWith(id);
    });
  });
  it('유저 고유식별자로 유저 조회가 되지 않을 경우 null을 반환한다', async () => {
    // arrange
    const id = 'not-existed-user-uuid';
    userRepository.getOneUserById.mockReturnValue(null);

    // act
    const result = await service.getOneUser(id);

    // assert
    expect(result).toBeNull();
    expect(userRepository.getOneUserById).toHaveBeenCalledWith(id);
  });
});
