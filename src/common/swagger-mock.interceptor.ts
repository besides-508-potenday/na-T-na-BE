import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SwaggerMockApiService } from './swagger-mock-api.service';

@Injectable()
export class SwaggerMockInterceptor implements NestInterceptor {
  constructor(private mockApiService: SwaggerMockApiService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Swagger UI에서 요청을 보낼 때 필요한 헤더 설정
    const isFromSwagger = this.isSwaggerRequest(request);
    if (!isFromSwagger) {
      return next.handle();
    }

    console.log(`Swagger Mock Mode: ${request.method} ${request.url}`);
    const url = request.url;
    const method = request.method;

    return new Observable((observer) => {});
  }

  private isSwaggerRequest(request: Request): boolean {
    const userAgent = String(request.headers['user-agent'] || '');
    const referer = String(request.headers['referer'] || '');

    if (userAgent.includes('Swagger UI') || referer.includes('swagger-ui')) {
      return true;
    }

    if (typeof referer === 'string' && referer.includes('/api-docs')) {
      return true;
    }

    if (request.headers['x-requested-with'] === 'swagger-ui') {
      return true;
    }

    return false;
  }
}
