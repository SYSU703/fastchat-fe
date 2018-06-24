import { UserComplete, ChatBasic } from '@/models';

export interface FriendBasic extends UserComplete {
  chatId: string; // 与好友的私聊的chatId
}

export interface FriendWithChatInfo {
  friendInfo: UserComplete;
  chatInfo: ChatBasic;  // 私聊的基本信息
}
