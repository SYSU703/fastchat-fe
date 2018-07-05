import { UserComplete } from '@/models';

export interface Message {
  messageId: string;  // auto increment。方便比较消息的新旧。
  content: string;
  from: string;
}

export function messageHasChanged(message1: Message | null, message2: Message | null) {
  return !!(
    (message1 && !message2)
    || (!message1 && message2)
    || (message1 && message2 && message1.messageId !== message2.messageId)
  );
}

export interface ChatBasic {
  chatId: string;
  chatName: string | null;  // 私聊的chatName必须为null，群聊的必须为string
  isGroup: boolean;
  lastestMessage: Message | null;  // 用于在群聊列表直接显示最近一条消息。还可以用来判断是否有未读消息。
}

export function chatHasChanged(chat1: ChatBasic, chat2: ChatBasic) {
  if (chat1.chatId !== chat2.chatId) {
    throw new Error(`chatId不能改变`);
  }
  if (chat1.chatName !== chat2.chatName) { return true; }
  return messageHasChanged(chat1.lastestMessage, chat2.lastestMessage);
}

export function chatListhasChange(oldChatList: Map<string, ChatBasic>, newChatList: ChatBasic[]) {
  if (oldChatList.size !== newChatList.length) { return true; }
  for (const chat of newChatList) {
    const oldChat = oldChatList.get(chat.chatId);
    if (!oldChat) { return true; }
    if (chatHasChanged(oldChat, chat)) { return true; }
  }
  return false;
}

export interface ChatComplete extends ChatBasic {
  chatMembers: UserComplete[];
  chatMessages: Message[];
}

export interface GroupInvitation {
  invId: string;
  from: string;
  to: string;
  chatId: string;
  chatName: string;
  time: Date;
  state: 'rejected' | 'accepted' | 'pending';
  message: string;
  fromNickname: string;
  toNickname: string;
}
