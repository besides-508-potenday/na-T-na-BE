import { StartedMySqlContainer, MySqlContainer } from '@testcontainers/mysql';
import { execSync } from 'child_process';

export class TestDatabase {
  private static instance: TestDatabase;
  private container: StartedMySqlContainer | null;

  private constructor() {}
  public static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async start(): Promise<string> {
    if (!this.container) {
      console.log('🐳 Starting MySQL TestContainer...');

      this.container = await new MySqlContainer('mysql:8.0')
        .withDatabase('test_db')
        .withUsername('test_user')
        .withUserPassword('test_password')
        .withRootPassword('root_password')
        .withCommand(['--default-authentication-plugin=mysql_native_password'])
        .withTmpFs({ '/var/lib/mysql': 'rw' }) // 메모리에서 실행하여 속도 향상
        .start();

      console.log('✅ MySQL TestContainer started');
    }

    return `mysql://${this.container.getUsername()}:${this.container.getUserPassword()}@${this.container.getHost()}:${this.container.getPort()}/${this.container.getDatabase()}`;
  }

  async stop(): Promise<void> {
    if (this.container) {
      console.log('🛑 Stopping MySQL TestContainer...');
      await this.container.stop();
      this.container = null;
      console.log('✅ MySQL TestContainer stopped');
    }
  }
  async reset(): Promise<void> {
    if (this.container) {
      // 모든 테이블 삭제

      const databaseUrl = await this.start();

      try {
        execSync('npx prisma migrate reset --force --skip-generate', {
          env: { ...process.env, DATABASE_URL: databaseUrl },
        });
      } catch (error) {
        console.warn('⚠️ Database reset failed, recreating schema...');
        execSync('npx prisma db push --force-reset', {
          env: { ...process.env, DATABASE_URL: databaseUrl },
          stdio: 'pipe',
        });
      }
    }
  }
}

export const TEST_DB = TestDatabase.getInstance();
