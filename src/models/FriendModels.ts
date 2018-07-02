import { UserComplete, ChatBasic } from '@/models';

export interface FriendBasic extends UserComplete {
  chatId: string; // 与好友的私聊的chatId
}

export interface FriendWithChatInfo {
  friendInfo: UserComplete;
  chatInfo: ChatBasic;  // 私聊的基本信息
}

export interface AddFriendRequest {
  reqId: string;
  from: string;
  to: string;
  time: Date;
  state: 'rejected' | 'accepted' | 'pending';
  message: string;
  fromNickname: string;
  toNickname: string;
}
