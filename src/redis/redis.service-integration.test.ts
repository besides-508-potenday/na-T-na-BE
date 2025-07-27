import { TestingModule, Test } from '@nestjs/testing';
import { StartedTestContainer, GenericContainer } from 'testcontainers'; // Ensure this is the correct library
import { RedisService } from './redis.service';
import { RedisModule } from '@nestjs-modules/ioredis';

describe('RedisService', () => {
  let module: TestingModule;
  let service: RedisService;
  let redisContainer: StartedTestContainer;

  beforeAll(async () => {
    redisContainer = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start();

    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          type: 'single',
          options: {
            host: redisHost,
            port: redisPort,
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
          },
        }),
      ],
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);

    // Redis와 연결될때까지 3초 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    if (service && 'quit' in service && typeof service.quit === 'function') {
      await service.quit(); // ioredis의 quit 메서드 호출
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
  });

  beforeEach(async () => {
    // 각 테스트 전에 Redis데이터 정리
  });

  describe('SET & GET', () => {
    it('Should set and get a value', async () => {
      const key = 'integration-test-key';
      const value = 'integration-test-value';

      // act
      await service.set(key, value);
      const result = await service.get(key);

      // assert
      expect(result).toBe(value);

      // clean up
      await service.del(key);
    });
  });
});
