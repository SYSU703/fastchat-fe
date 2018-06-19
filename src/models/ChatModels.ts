import { UserComplete, UserName } from '@/models';

export interface Message {
  messageId: string;  // auto increment。方便比较消息的新旧。
  content: string;
  from: UserName;
}

export interface ChatBasic {
  chatId: string;
  chatName: string | null;  // 私聊的chatName必须为null，群聊的必须为string
  isGroup: boolean;
  lastestMessage: Message;  // 用于在群聊列表直接显示最近一条消息。还可以用来判断是否有未读消息。
}

export interface ChatComplete extends ChatBasic {
  chatMembers: UserComplete[];
  chatHistory: Message[];
}
