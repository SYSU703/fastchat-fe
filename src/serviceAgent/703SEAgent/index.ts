import axios, { AxiosRequestConfig } from 'axios';
import { ServiceAgent, ServiceAgentVuePlugin, Response } from '@/serviceAgent';
import {
  RegisterInfo,
  LoginCredentials,
  UserComplete,
  AddFriendRequest,
  ChatBasic,
  FriendBasic,
  chatListhasChange,
  GroupInvitation,
  Message,
} from '@/models';
import { SERVER_ADDR } from '@/constants';

export class SE703Agent extends ServiceAgentVuePlugin implements ServiceAgent {
  private userName: string = '';
  private nickName: string = '';

  public async register({ userName, password, nickname, gender }: RegisterInfo): Promise<Response<undefined>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/Register`, {
      username: userName,
      password, nickname, sex: gender,
    });
    return { success: true, msg: 'ok', data: undefined };
  }

  public async login({ userName, password }: LoginCredentials): Promise<Response<UserComplete>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/Login`, {
      username: userName, password,
    });
    if (res.data.result !== 'success') {
      throw new Error('登陆失败');
    }
    this.userName = userName;
    const res2 = await axios.post(`${SERVER_ADDR}/Chat/GetCompleteUserInfo`, {
      username: userName,
    });
    this.nickName = res2.data.userNickName;
    const user = {
      userName,
      nickname: res2.data.userNickName,
      email: '',
      gender: res2.data.userSex,
    } as UserComplete;
    window.sessionStorage.setItem('703SEuser', JSON.stringify(user));
    return {
      success: true, msg: 'ok', data: {
        userName,
        nickname: res2.data.userNickName,
        email: '',
        gender: res2.data.userSex,
      },
    };
  }

  public async logout(): Promise<Response<undefined>> {
    window.sessionStorage.removeItem('703SEuser');
    return {
      success: true,
      msg: 'ok',
      data: undefined,
    };
  }

  public tryResumeSession(): UserComplete | null {
    const s = window.sessionStorage.getItem('703SEuser');
    if (!s) {
      return null;
    } else {
      const user: UserComplete = JSON.parse(s);
      this.userName = user.userName;
      this.nickName = user.nickname;
      return user;
    }
  }

  public subscribeUpdate(
    // 登陆用户的基本信息发生改变
    userUpdate: (user: UserComplete) => void,
    // 增加删除好友，以及有好友的基本信息发生改变
    friendListUpdate: (friends: FriendBasic[]) => void,
    // 增加删除chat，以及有chat的chatName发生改变、lastestMessage改变
    chatListUpdate: (chats: ChatBasic[]) => void,
    // 某个chat的成员数量、成员信息发生改变
    oneChatMembersUpdate: (members: UserComplete[]) => void,
  ) {
    return null;
  }

  public unsubscribeUpdate() {
    return null;
  }

  public async getChats(): Promise<Response<ChatBasic[]>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/GetAllFriendInfo`, {
      username: this.userName,
    });
    const pChats = (res.data.friendlist as any[]).map<ChatBasic>((fri) => ({
      chatId: JSON.stringify([false, fri.userId]),
      isGroup: false,
      chatName: null,
      lastestMessage: fri.lastMessage ? {
        content: fri.lastMessage.message,
        from: fri.lastMessage.sender_uid,
        messageId: fri.lastMessage.record_time,
      } : null,
    }));
    const res2 = await axios.post(`${SERVER_ADDR}/Chat/GetAllGroupInfo`, {
      username: this.userName,
    });
    const gchats = (res2.data.grouplist as any[]).map<ChatBasic>((gr) => ({
      chatId: JSON.stringify([true, gr.groupId]),
      isGroup: true,
      chatName: gr.groupName,
      lastestMessage: gr.lastMessage ? {
        content: gr.lastMessage.message,
        from: gr.lastMessage.sender_uid,
        messageId: gr.lastMessage.record_time,
      } : null,
    }));
    return { success: true, msg: 'ok', data: [...pChats, ...gchats] };
  }

  public async getFriends(): Promise<Response<FriendBasic[]>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/GetAllFriendInfo`, {
      username: this.userName,
    });
    const arr = (res.data.friendlist as any[]).map<FriendBasic>((friend) => ({
      userName: friend.userId,
      nickname: friend.userNickName,
      email: '',
      gender: friend.userSex,
      chatId: JSON.stringify([false, friend.userId]),
    }));
    return { success: true, msg: 'ok', data: arr };
  }

  public async getFriendRequests(): Promise<Response<AddFriendRequest[]>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/GetFriendApplyInfo`, {
      username: this.userName,
    });
    const fromMe: AddFriendRequest[] = res.data.userlist.map((req: any) => ({
      reqId: JSON.stringify([this.userName, req.userName]),
      from: this.userName,
      to: req.userName,
      time: new Date('null'),
      state: req.state === 'waiting' ? 'pending' : 'accepted',
      message: '',
      fromNickname: this.nickName,
      toNickname: req.nickName,
    } as AddFriendRequest));
    const res2 = await axios.post(`${SERVER_ADDR}/Chat/GetFriendInviteInfo`, {
      username: this.userName,
    });
    const toMe: AddFriendRequest[] = res2.data.userlist.map((req: any) => ({
      reqId: JSON.stringify([req.userName, this.userName]),
      to: this.userName,
      from: req.userName,
      time: new Date('null'),
      state: req.state === 'waiting' ? 'pending' : 'accepted',
      message: '',
      toNickname: this.nickName,
      fromNickname: req.nickName,
    } as AddFriendRequest));
    return { success: true, msg: 'ok', data: [...fromMe, ...toMe] };
  }

  public async getGroupInvitations(): Promise<Response<GroupInvitation[]>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/GetAllGroupInvite`, {
      username: this.userName,
    });
    const invs = (res.data.grouplist as any[]).map<GroupInvitation>((g) => ({
      invId: g.groupId,
      chatName: g.groupName,
      from: g.managerId,
      fromNickname: g.managerNickName,
      to: this.userName,
      time: new Date('null'),
      state: 'pending',
      message: '',
      toNickname: this.nickName,
      chatId: JSON.stringify([true, g.groupId]),
    }));
    return { success: true, msg: 'ok', data: invs };
  }

  public async findUser(contain: string): Promise<Response<UserComplete[]>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/GetCompleteUserInfo`, {
      username: contain,
    });
    const users = [] as UserComplete[];
    if (res.data !== null) {
      users.push({
        userName: res.data.userId,
        nickname: res.data.userNickName,
        email: '',
        gender: res.data.userSex,
      });
    }
    return { success: true, msg: 'ok', data: users };
  }
  public async requestAddFriend(targetUserName: string, msg: string): Promise<Response<undefined>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/SendFriendRequest`, {
      sendername: this.userName,
      receivername: targetUserName,
    });
    if (res.data.result === 'success') {
      return { success: true, msg: 'ok', data: undefined };
    } else {
      throw new Error('发送好友请求失败');
    }
  }

  public async responseFriendRequest(reqId: string, accept: boolean): Promise<Response<undefined>> {
    const [sendername, receivername] = JSON.parse(reqId);
    const res = await axios.post(`${SERVER_ADDR}/Chat/HandleFriendRequest`, {
      sendername,
      receivername,
      agree: accept ? 'true' : 'false',
    });
    if (res.data.result === 'success') {
      return { success: true, msg: 'ok', data: undefined };
    } else {
      throw new Error('响应好友请求失败');
    }
  }

  public async getChatMessages(chatId: string): Promise<Response<Message[]>> {
    const [isGroup, id] = JSON.parse(chatId);
    if (isGroup) {
      const res = await axios.post(`${SERVER_ADDR}/Chat/GetRecordWithGroup`, {
        username: this.userName,
        groupid: id,
      });
      const messages = ((res.data.recordList || []) as any[]).map<Message>((ms) => ({
        content: ms.message, messageId: ms.record_time, from: ms.sender_uid,
      }));
      return { success: true, msg: 'ok', data: messages };
    } else {
      const res = await axios.post(`${SERVER_ADDR}/Chat/GetRecordWithFriend`, {
        username: this.userName,
        friendid: id,
      });
      const messages = ((res.data.recordList || []) as any[]).map<Message>((ms) => ({
        content: ms.message, messageId: ms.record_time, from: ms.sender_uid,
      }));
      return { success: true, msg: 'ok', data: messages };
    }
  }

  public async sendMessage(chatId: string, from: string, content: string): Promise<Response<Message>> {
    const [isGroup, id] = JSON.parse(chatId);
    let res;
    if (isGroup) {
      res = await axios.post(`${SERVER_ADDR}/Chat/SendGroupRecord`, {
        sendername: this.userName,
        groupid: id,
        message: content,
      });
    } else {
      res = await axios.post(`${SERVER_ADDR}/Chat/SendFriendRecord`, {
        sendername: this.userName,
        receivername: id,
        message: content,
      });
    }
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined as any };
    }
  }

  public async getChatMembers(chatId: string): Promise<Response<UserComplete[]>> {
    const [isGroup, id] = JSON.parse(chatId);
    let members;
    if (!isGroup) {
      const friendName = id;
      const res1 = await axios.post(`${SERVER_ADDR}/Chat/GetCompleteUserInfo`, {
        username: friendName,
      });
      const res2 = await axios.post(`${SERVER_ADDR}/Chat/GetCompleteUserInfo`, {
        username: this.userName,
      });
      members = [{
        userName: this.userName, nickname: res2.data.userNickName,
        email: '', gender: res2.data.userSex,
      },
      {
        userName: friendName, nickname: res1.data.userNickName,
        email: '', gender: res1.data.userSex,
      }] as UserComplete[];
    } else {
      const groupId = id;
      const res = await axios.post(`${SERVER_ADDR}/Chat/GetGroupMembers`, {
        groupid: groupId,
      });
      members = (res.data.userlist as any[]).map<UserComplete>((u) => ({
        userName: u.userId, nickname: u.userNickName, email: '', gender: u.userSex || 'male',
      }));
    }
    return { success: true, msg: 'ok', data: members };
  }

  public async createGroupChat(): Promise<Response<ChatBasic>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/CreateGroup`, {
      username: this.userName, groupname: '新建群聊',
    });
    if (res.data.result === 'fail') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined as any };
    }
  }

  public async changeUserInfo(info: UserComplete): Promise<Response<undefined>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/ModifyUser`, {
      username: this.userName, nickname: info.nickname, sex: info.gender,
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      const s = window.sessionStorage.getItem('703SEuser');
      if (!s) { throw new Error('sessionStorage中没有用户'); }
      const user: UserComplete = JSON.parse(s);
      Object.assign(user, info);
      window.sessionStorage.setItem('703SEuser', JSON.stringify(user));
      return { success: true, msg: 'ok', data: undefined };
    }
  }

  public async changePassword(userName: string, oldP: string, newP: string): Promise<Response<undefined>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/ModifyUser`, {
      username: this.userName, password: newP,
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined };
    }
  }

  public async postGroupInvitation(friendName: string, chatId: string, message: string): Promise<Response<undefined>> {
    const [isGroup, id] = JSON.parse(chatId);
    const res = await axios.post(`${SERVER_ADDR}/Chat/SendGroupInvite`, {
      username: friendName, groupid: id,
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined };
    }
  }

  public async responseGroupInvitation(invId: string, accept: boolean): Promise<Response<undefined>> {
    const res = await axios.post(`${SERVER_ADDR}/Chat/HandleGroupInvite`, {
      username: this.userName, groupid: invId, agree: 'true',
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined };
    }
  }

  public async  changeGroupChatName(chatId: string, newChatName: string): Promise<Response<undefined>> {
    const [isGroup, id] = JSON.parse(chatId);
    const res = await axios.post(`${SERVER_ADDR}/Chat/ModifyGroup`, {
      groupid: id, groupname: newChatName,
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined };
    }
  }

  public async deleteGroupMember(chatId: string, userName: string): Promise<Response<undefined>> {
    const [isGroup, id] = JSON.parse(chatId);
    const res = await axios.post(`${SERVER_ADDR}/Chat/QuitGroup`, {
      groupid: id, username: userName,
    });
    if (res.data.result !== 'success') {
      throw new Error('失败');
    } else {
      return { success: true, msg: 'ok', data: undefined };
    }
  }
}
