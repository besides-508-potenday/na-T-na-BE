import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotsService } from './chatbots.service';
import { IChatbotRepository } from '../domain/chatbot.repository.interface';

const mockChatbotRepositoryImpl = {
  getChatbots: jest.fn(),
};

describe('ChatbotsService', () => {
  let service: ChatbotsService;
  let chatbotRepository: typeof mockChatbotRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotsService,
        { provide: 'IChatbotRepository', useValue: mockChatbotRepositoryImpl },
      ],
    }).compile();

    service = module.get<ChatbotsService>(ChatbotsService);
    chatbotRepository = module.get<typeof mockChatbotRepositoryImpl>('IChatbotRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getChatbot() 호출하면 챗봇정보, 챗봇성격, 챗봇 프로필을 포함한 챗봇 정보 리스트를 리턴한다', async () => {
    const mockData = [
      {
        chatbot_id: 1,
        chatbot_name: '투닥이',
        chatbot_speciality: '공감 학습 능력기',
        chatbot_personalities: '소심함, 감정 과몰입, 인정 욕구, 관계 중심 정서',
      },
    ];
    chatbotRepository.getChatbots.mockReturnValue(mockData);

    const result = await service.getChatbots();

    expect(result.length).toEqual(1);
    expect(result[0]).toHaveProperty(
      'chatbot_profile_image',
      'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/1/profile.png',
    );
    expect(chatbotRepository.getChatbots).toHaveBeenCalled();
  });
});
