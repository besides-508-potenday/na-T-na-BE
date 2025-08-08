import { HttpStatus } from '@nestjs/common';
import { MAXIMUM_MESSAGE_LENGTH } from '../../messages/domain/message-business-rule';

/**
 * - SNACKBAR: 채팅UI의 에러 스낵바 UI
 * - UI_PAGE : 에러 페이지 UI
 */
export enum ErrorUI {
  'SNACKBAR' = 'SNACKBAR',
  'UI_PAGE' = 'UI_PAGE',
}

type NaTnaPolicyError = {
  errorCode: string;
  message: string;
  statusCode: HttpStatus;
  errorUiType: ErrorUI;
};

const POLICY_ERRORS: Map<string, NaTnaPolicyError> = new Map([
  [
    'NERR_POLICY_INAPPROPRIATE_USER_MESSAGE',
    {
      errorCode: 'NERR_POLICY_INAPPROPRIATE_USER_MESSAGE',
      message: '부적절한 메시지가 감지되었어요.',
      statusCode: HttpStatus.BAD_REQUEST,
      errorUiType: ErrorUI.SNACKBAR,
    },
  ],
  [
    'NERR_POLICY_USER_MESSAGE_OVER_MAXIMUM',
    {
      errorCode: 'NERR_POLICY_USER_MESSAGE_OVER_MAXIMUM',
      message: `메시지 입력 최대길이는 ${MAXIMUM_MESSAGE_LENGTH}자 입니다.`,
      statusCode: HttpStatus.BAD_REQUEST,
      errorUiType: ErrorUI.SNACKBAR,
    },
  ],
]);

export { POLICY_ERRORS, NaTnaPolicyError };
