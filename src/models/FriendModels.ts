import { UserComplete, ChatBasic } from '@/models';

export interface Friend {
  friendInfo: UserComplete;
  chatInfo: ChatBasic;  // 私聊的基本信息
}
