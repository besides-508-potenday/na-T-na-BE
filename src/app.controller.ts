import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('simple')
  @Get('health')
  @HealthCheck()
  simpleCheck() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }

  // @Get('health')
  // @HealthCheck()
  // async check(): Promise<HealthCheckResult> {
  //   return this.health.check([
  //     // 데이터베이스 헬스 체크
  //     () => this.prismaHealthCheck(),
  //     // 메모리 사용량 체크 (512MB 이하)
  //     () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
  //     // 디스크 사용량 체크(80% 이하)
  //     () =>
  //       this.disk.checkStorage('storage', {
  //         path: '/',
  //         thresholdPercent: 0.8,
  //       }),
  //   ]);
  // }

  // private async prismaHealthCheck(): Promise<HealthIndicatorResult> {
  //   try {
  //     const startTime = Date.now();

  //     // DB연결 응답 시간 측정
  //     await this.prismaService.$queryRaw`SELECT 1`;
  //     const responseTime = Date.now() - startTime;

  //     return {
  //       database: {
  //         status: 'up',
  //         message: 'Database connection is healthy',
  //         responseTime: `${responseTime}ms`,
  //         timestamp: new Date().toISOString(),
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       database: {
  //         status: 'down',
  //         message: `Database connection failed: ${error}`,
  //         timestamp: new Date().toISOString(),
  //       },
  //     };
  //   }
  // }
}
