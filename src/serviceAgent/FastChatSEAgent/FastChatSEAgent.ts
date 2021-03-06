import {
  RegisterInfo,
  LoginCredentials,
  UserComplete,
  AddFriendRequest,
  ChatBasic,
  FriendBasic,
  chatListhasChange,
  GroupInvitation,
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
    // this.intervalId = window.setInterval(async () => {
    //   const res = await this.getChats();
    //   const chats = res.data;
    //   if (chatListhasChange(store.state.chats.chats, chats)) {
    //     chatListUpdate(chats);
    //   }
    // }, 2000);
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

  public async requestAddFriend(targetUserName: string, msg: string): Promise<Response<undefined>> {
    const res = await friendsRS.post('requests', { to: targetUserName, msg });
    return res.data;
  }

  public async getFriendRequests(): Promise<Response<AddFriendRequest[]>> {
    const res = await friendsRS.get<Response<AddFriendRequest[]>>('requests');
    for (const req of res.data.data) {
      // js的timestamp以毫秒为精度，而不是秒
      req.time = new Date(+(req.time + '000'));
    }
    return res.data;
  }

  public async responseFriendRequest(reqId: string, accept: boolean): Promise<Response<undefined>> {
    const res = await friendsRS.patch(`requests/${reqId}`,
      { state: accept ? 'accepted' : 'rejected' });
    return res.data;
  }

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

  public async findUser(contain: string): Promise<Response<UserComplete[]>> {
    const res = await usersRS.get('', {
      params: {
        contain,
      },
    });
    return res.data;
  }

  public async changeUserInfo(info: UserComplete): Promise<Response<undefined>> {
    const res = await usersRS.patch<Response<undefined>>(`${info.userName}/info`, info);
    if (res.data.success) {
      // 修改成功以后要更新本地存储
      const oldSession = window.sessionStorage.getItem('session');
      if (!oldSession) { throw new Error('oldSession not exist!'); }
      const { jwt, oldInfo } = JSON.parse(oldSession);
      window.sessionStorage.setItem('session', JSON.stringify({
        jwt,
        userInfo: info,
      }));
    }
    return res.data;
  }

  public async changePassword(userName: string, oldP: string, newP: string): Promise<Response<undefined>> {
    const res = await usersRS.patch<Response<undefined>>(`${userName}/password`,
      { oldP, newP });
    return res.data;
  }

  public async postGroupInvitation(friendName: string, chatId: string, message: string): Promise<Response<undefined>> {
    const res = await chatsRS.post(`invitations`, {
      friendName, message, chatId,
    });
    return res.data;
  }

  public async getGroupInvitations(): Promise<Response<GroupInvitation[]>> {
    const res = await chatsRS.get<Response<GroupInvitation[]>>(`invitations`);
    for (const req of res.data.data) {
      // js的timestamp以毫秒为精度，而不是秒
      req.time = new Date(+(req.time + '000'));
    }
    return res.data;
  }

  public async responseGroupInvitation(invId: string, accept: boolean)
    : Promise<Response<undefined>> {
    const res = await chatsRS.patch(`invitations/${invId}`,
      { state: accept ? 'accepted' : 'rejected' });
    return res.data;
  }

  public async changeGroupChatName(chatId: string, newChatName: string): Promise<Response<undefined>> {
    const res = await chatsRS.patch(`${chatId}`, { chatName: newChatName });
    return res.data;
  }

  public async deleteGroupMember(chatId: string, userName: string): Promise<Response<undefined>> {
    const res = await chatsRS.delete(`${chatId}/members/${userName}`);
    return res.data;
  }
}
