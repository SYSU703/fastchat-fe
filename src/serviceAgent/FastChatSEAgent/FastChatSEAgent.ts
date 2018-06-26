import {
  RegisterInfo,
  LoginCredentials,
  UserName,
  UserComplete,
  Message,
  ChatBasic,
  FriendBasic,
  chatListhasChange,
} from '@/models';
import { ServiceAgent, ServiceAgentVuePlugin, Response } from '@/serviceAgent';
import {
  configJWTHeader,
  sessionRS,
  usersRS,
  friendsRS,
  chatsRS,
} from '@/serviceAgent/FastChatSEAgent';
import store from '@/store';

export class FastChatSEAgent extends ServiceAgentVuePlugin implements ServiceAgent {
  private userUpdate: (user: UserComplete) => void = (null as any);
  private friendListUpdate: (friends: FriendBasic[]) => void = (null as any);
  private chatListUpdate: (chats: ChatBasic[]) => void = (null as any);
  private oneChatMembersUpdate: (members: UserComplete[]) => void = (null as any);
  private intervalId = -1;

  public subscribeUpdate(
    userUpdate: (user: UserComplete) => void,
    friendListUpdate: (friends: FriendBasic[]) => void,
    chatListUpdate: (chats: ChatBasic[]) => void,
    oneChatMembersUpdate: (members: UserComplete[]) => void,
  ) {
    this.userUpdate = userUpdate;
    this.friendListUpdate = friendListUpdate;
    this.chatListUpdate = chatListUpdate;
    this.oneChatMembersUpdate = oneChatMembersUpdate;
    this.intervalId = window.setInterval(async () => {
      const res = await this.getChats();
      const chats = res.data;
      if (chatListhasChange(store.state.chats.chats, chats)) {
        chatListUpdate(chats);
      }
    }, 2000);
  }

  public unsubscribeUpdate() {
    window.clearInterval(this.intervalId);
    this.intervalId = -1;
    this.userUpdate = this.friendListUpdate =
      this.chatListUpdate = this.oneChatMembersUpdate = null as any;
  }

  public async login(loginCredentials: LoginCredentials) {
    const res = await sessionRS
      .post<Response<{ userInfo: UserComplete, jwt: string }>>('', loginCredentials);
    const { msg, success, data } = res.data;
    const { jwt, userInfo } = data;
    configJWTHeader(jwt);
    // 将会话信息保存在本地存储中，以便刷新以后恢复会话
    window.sessionStorage.setItem('session', JSON.stringify(data));
    return { msg, success, data: userInfo };
  }

  public async logout() {
    window.sessionStorage.removeItem('session');
    configJWTHeader('');
    return {
      success: true,
      msg: 'ok',
      data: undefined,
    };
  }

  public tryResumeSession() {
    // 尝试从本地存储中恢复会话
    const oldSession = window.sessionStorage.getItem('session');
    if (!oldSession) { return null; }
    const { jwt, userInfo } = JSON.parse(oldSession);
    configJWTHeader(jwt);
    return userInfo;
  }

  public async register(registerInfo: RegisterInfo) {
    const res = await usersRS.post('', registerInfo);
    return res.data;
  }
  public async getFriends() {
    const res = await friendsRS.get('');
    return res.data;
  }
  public async getChats() {
    const res = await chatsRS.get('');
    return res.data;
  }

  public requestAddFriend(target: UserName) { return 0 as any; }

  public async getChatMembers(chatId: string) {
    const res = await chatsRS.get(`${chatId}/members`);
    return res.data;
  }
  public async getChatMessages(chatId: string) {
    const res = await chatsRS.get(`${chatId}/messages`);
    return res.data;
  }

  public async sendMessage(chatId: string, from: string, content: string) {
    const res = await chatsRS.post(`${chatId}/messages`, { from, content });
    return res.data;
  }
  public async createGroupChat(): Promise<Response<ChatBasic>> {
    const res = await chatsRS.post('', { chatName: '默认群名' });
    return res.data;
  }
}
