import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorUI } from './policy-errors';
import { MAXIMUM_MESSAGE_LENGTH } from 'src/messages/domain/message-business-rule';

export class BaseCustomException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorUI: ErrorUI = ErrorUI.UI_PAGE,
    public readonly errorCode?: string,
    public readonly details?: any,
  ) {
    super(
      {
        message,
        statusCode,
        errorUI,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

/** 부적절한 메시지 검출 */
export class InAppropriateUserMessageException extends BaseCustomException {
  constructor(details?: any) {
    super(
      '부적절한 메시지가 감지되었어요.',
      HttpStatus.BAD_REQUEST,
      ErrorUI.SNACKBAR,
      'NERR_POLICY_INAPPROPRIATE_USER_MESSAGE',
      details,
    );
  }
}

export class MessageLengthOverMaximumException extends BaseCustomException {
  constructor(details?: any) {
    super(
      `메시지 입력 최대길이는 ${MAXIMUM_MESSAGE_LENGTH}자 입니다.`,
      HttpStatus.BAD_REQUEST,
      ErrorUI.SNACKBAR,
      'NERR_POLICY_USER_MESSAGE_OVER_MAXIMUM',
      details,
    );
  }
}

/** 일반적인 에러메시지 : errorCode가 없음 */
export class BadRequestException extends BaseCustomException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, ErrorUI.UI_PAGE, undefined, details);
  }
}

export class ResourceNotFoundException extends BaseCustomException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.NOT_FOUND, ErrorUI.UI_PAGE, undefined, details);
  }
}

export class ForbiddenException extends BaseCustomException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.FORBIDDEN, ErrorUI.UI_PAGE, undefined, details);
  }
}

export class InternalServiceErrorException extends BaseCustomException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorUI.UI_PAGE, undefined, details);
  }
}

export class ServiceUnavailableException extends BaseCustomException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, ErrorUI.UI_PAGE, undefined, details);
  }
}
