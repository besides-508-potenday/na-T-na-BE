import { config } from 'dotenv';
import { join } from 'path';

// 환경변수 로드
config({ path: join(__dirname, '../.env.test') });

// TestContainers
global.setImmediate =
  global.setImmediate ||
  ((fn: (...args: any[]) => void, ...args: any[]) =>
    global.setTimeout(fn, 0, ...args));

jest.setTimeout(60000); // 60초로 타임아웃 설정

// 콘솔 로그 레벨 설정 (선택사항)
if (process.env.NODE_ENV === 'test') {
  console.log('🧪 E2E Test environment initialized');
}

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, cleaning up...');
  process.exit(0);
});
