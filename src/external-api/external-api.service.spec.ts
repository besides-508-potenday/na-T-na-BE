import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { HttpModule } from '@nestjs/axios';
import { QuizesModule } from 'src/quizes/quizes.module';
import { RedisService } from 'src/redis/redis.service';

describe('ExternalApiService', () => {
  let service: ExternalApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, QuizesModule],
      providers: [
        ExternalApiService,
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            setJson: jest.fn(),
            getJson: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('[POST] /situation', () => {
    it('[POST] /situation API 호출에 성공한다', () => {
      // 리턴은 quiz_list: string[] 을 받아야함.
    });
  });
});
