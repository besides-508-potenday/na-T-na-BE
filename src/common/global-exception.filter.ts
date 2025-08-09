import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { Request, Response } from 'express';
import { BaseCustomException } from './custom-exceptions/base-custom-exception';
import { ErrorUI } from './custom-exceptions/policy-errors';

interface ErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  message: string;
  errorCode?: string;
  details?: any;
  stack?: string;
  event?: any;
  method?: string;
  path?: string;
  errorUI?: ErrorUI;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorResponse = this.buildHttpErrorResponse(exception, request);

    // 에러 로깅
    this.logError(exception, request, errorResponse);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /** HTTP */
  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildHttpErrorResponse(exception, request);

    // HTTP 에러 로깅
    this.logError(exception, request, errorResponse);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildHttpErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;
    let details: any;
    let stack: string | undefined;

    if (exception instanceof BaseCustomException) {
      // 커스텀 Exception 처리
      statusCode = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      errorCode = response.errorCode;
      details = response.details;
    } else if (exception instanceof HttpException) {
      // NestJS 기본 HttpException 처리
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || exception.message;
        details = response;
      }
    } else if (exception instanceof Error) {
      // 일반 Error 처리
      message = exception.message;
      stack = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }

    return {
      success: false,
      statusCode,
      timestamp,
      path,
      method,
      message,
      errorCode,
      details,
      errorUI: ErrorUI.UI_PAGE,
      ...(stack && { stack }),
    };
  }

  /** Common Logger */
  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';

    const logContext = {
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      timestamp: errorResponse.timestamp,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${method} ${url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext, null, 2),
      );
      // 500번대 그이상의 에러가 발생하면 서버 종료.
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${method} ${url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
        JSON.stringify(logContext, null, 2),
      );
      // 400번대 에러가 발생하면 서버는 계속 진행.
    }
  }
}
