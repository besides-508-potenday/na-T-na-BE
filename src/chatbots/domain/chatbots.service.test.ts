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

  it('getChatbot() : 호출하면 챗봇정보, 챗봇성격, 챗봇 프로필을 포함한 챗봇 정보 리스트를 리턴한다', async () => {
    const mockData = [
      {
        chatbot_id: 1,
        chatbot_name: '투닥이',
        chatbot_speciality: '공감 학습 능력기',
        chatbot_personalities: '소심함, 감정 과몰입, 인정 욕구, 관계 중심 정서',
        is_unknown: false,
      },
      {
        chatbot_id: 2,
        chatbot_name: '썸고수_???',
        chatbot_speciality: '연애 공감 시뮬레이션',
        chatbot_personalities: null,
        is_unknown: true,
      },
    ];
    chatbotRepository.getChatbots.mockReturnValue(mockData);

    const result = await service.getChatbots();

    // 챗봇리스트 개수
    expect(result.length).toEqual(2);

    // 활성챗봇
    expect(result[0]).toHaveProperty(
      'chatbot_profile_image',
      'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/1/profile.png',
    );
    expect(result[0].is_unknown).toBe(false);

    // 비활성 챗봇
    expect(result[1]).toHaveProperty(
      'chatbot_profile_image',
      'https://na-t-na-s3.s3.ap-northeast-2.amazonaws.com/chatbots/2/unknown.png',
    );
    expect(result[1].is_unknown).toBe(true);
    expect(result[1].chatbot_personalities).toBeNull();

    expect(chatbotRepository.getChatbots).toHaveBeenCalled();
  });
});
