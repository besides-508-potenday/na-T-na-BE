import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';

// 의존성 모킹
const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
};

const mockHealthCheckService = {
  check: jest.fn().mockResolvedValue({
    status: 'ok',
    info: {},
    error: {},
    details: {},
  }),
};

const mockMemoryHealthIndicator = {
  checkHeap: jest.fn().mockReturnValue({
    memory_heap: { status: 'up' },
  }),
};

const mockDiskHealthIndicator = {
  checkStorage: jest.fn().mockReturnValue({
    storage: { status: 'up' },
  }),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
        { provide: DiskHealthIndicator, useValue: mockDiskHealthIndicator },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });
});
