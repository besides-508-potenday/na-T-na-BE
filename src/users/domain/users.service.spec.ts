import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

const mockUserRepositoryImpl = {
  createUser: jest.fn(),
  getOneUserById: jest.fn(),
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

  it('createUser(): 유저 생성할 수 있다', () => {
    const nickname = '투닥이';
    const mockUser = { id: 'test-uuid', nickname: nickname };
    userRepository.createUser.mockReturnValue(mockUser);

    const result = userRepository.createUser(nickname);
    expect(result.nickname).toEqual(nickname);

    expect(userRepository.createUser).toHaveBeenCalledWith(nickname);
  });

  it('getUserById(): 고유식별자로 단일 유저를 조회할 수 있다.', () => {
    const id = '1234';
    const mockUser = { id: 'test-uuid', nickname: '투닥이' };
    userRepository.getOneUserById.mockReturnValue(mockUser);

    const result = userRepository.getOneUserById(id);
    expect(result.nickname).toEqual('투닥이');
    expect(result.id).toEqual('test-uuid');

    expect(userRepository.getOneUserById).toHaveBeenCalledWith(id);
  });
});
