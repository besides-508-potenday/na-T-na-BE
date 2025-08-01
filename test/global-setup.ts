import { TEST_DB } from './test-database';
import { execSync } from 'child_process';

export default async (): Promise<void> => {
  console.log('🚀 Setting up global test environment...');

  // 전역으로 한번만 컨테이너 시작
  const databaseUrl = await TEST_DB.start();

  // 환경변수 설정
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = 'test';

  // 초기 스키마 적용
  try {
    console.log('📋 Applying initial database schema...');
    execSync('npx prisma generate', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    await TEST_DB.reset();

    execSync('npx prisma db push', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  }

  console.log('🎯 Global test environment ready!');
};
