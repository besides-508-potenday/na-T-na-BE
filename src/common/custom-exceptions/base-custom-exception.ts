import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorUI, POLICY_ERRORS } from './policy-errors';

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
    const { message, errorCode, statusCode, errorUiType } =
      POLICY_ERRORS['NERR_POLICY_INAPPROPRIATE_USER_MESSAGE'];
    super(message, statusCode, errorUiType, errorCode, details);
  }
}

export class MessageLengthOverMaximumException extends BaseCustomException {
  constructor(details?: any) {
    const { message, errorCode, statusCode, errorUiType } =
      POLICY_ERRORS['NERR_POLICY_USER_MESSAGE_OVER_MAXIMUM'];

    super(message, statusCode, errorUiType, errorCode, details);
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
