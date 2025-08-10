export interface IUserRepository {
  getUserByChatroomId(chatroomId: string);
  // 유저생성
  createUser(userNickname: string);

  // 유저조회
  getOneUserById(userId: string);
}
