import { SwaggerMockApiService } from './swagger-mock-api.service';
import { SwaggerMockInterceptor } from './swagger-mock.interceptor';

describe('SwaggerMockInterceptor', () => {
  it('should be defined', () => {
    const mockApiService = {} as SwaggerMockApiService; // Provide a mock implementation
    expect(new SwaggerMockInterceptor(mockApiService)).toBeDefined();
  });
});
