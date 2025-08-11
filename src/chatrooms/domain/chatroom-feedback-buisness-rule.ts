import { BadRequestException } from 'src/common/custom-exceptions/base-custom-exception';
import S3_URL from 'src/common/S3_URL';

export const CHATBOT_TURN_COUNT = 5 as const;
/**
 * ex) current_distance : 5 => 100m
 * ex) current_distance : 4 => 80m
 * ex) current_distance : 3 => 60m
 * ex) current_distance : 2 => 40m
 * ex) current_distance : 1 => 20m
 * ex) current_distance : 0 => 0m
 */
export const RESULT_DISTANCE = (current_distance: number) => {
  return 20 * current_distance;
};

export const CHATBOT_RESULT_IMAGE = (chatbot_id: number, current_distance: number) => {
  switch (current_distance) {
    case 5:
      return `${S3_URL}/chatbots/${chatbot_id}/results/result_0.png`;
    case 4:
      return `${S3_URL}/chatbots/${chatbot_id}/results/result_1.png`;
    case 3:
    case 2:
      return `${S3_URL}/chatbots/${chatbot_id}/results/result_2.png`;
    case 1:
      return `${S3_URL}/chatbots/${chatbot_id}/results/result_3.png`;
    case 0:
      return `${S3_URL}/chatbots/${chatbot_id}/results/result_4.png`;
    default:
      throw new BadRequestException(
        '올바르지 않은 데이터입니다.',
        '챗봇과의 사이거리가 올바르지 않습니다.',
      );
  }
};
