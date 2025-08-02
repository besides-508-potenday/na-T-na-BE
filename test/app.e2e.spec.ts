import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TEST_DB } from './test-database';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    console.log('🔧 Setting up NestJS application...');
    // 테스트컨테이너 정의
    const dbUrl = await TEST_DB.start();
    process.env.DATABASE_URL = dbUrl;

    // Nestjs 애플리케이션 실행
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
    console.log('🚀 NestJS application ready!');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up NestJS application...');

    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // 각 테스트전에 데이터만 정리
    await TEST_DB.reset();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
