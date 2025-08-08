export const MAXIMUM_MESSAGE_LENGTH = 60;

export const INITIAL_GREETING_FIXED_MESSAGE = (userNickname: string) =>
  `저기.. ${userNickname}..! 잘지냈어? 혹시 내가 할말이 있는데 들어줄래?`;

export const LAST_FIXED_MESSAGE = (userNickname: string) =>
  `오늘 너랑 얘기해서 정말 즐거웠어. ${userNickname}! 저기... 사실 너에게 하고 싶은 말이 있어서... 편지로 써봤는데, 혹시 받아줄래? 👉👈`;

export const INVALID_MESSAGE_KEYWORDS: string[] = [
  '죽음',
  '자살',
  '폭력',
  '학대',
  '중증',
  '우울증',
  '트라우마',
];
