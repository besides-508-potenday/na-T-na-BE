import { TEST_DB } from './test-database';

export default async (): Promise<void> => {
  console.log('🧹 Cleaning up global test environment...');

  // 전역적으로 컨테이너 정리
  await TEST_DB.stop();

  console.log('✅ Global test environment cleaned up');
};
