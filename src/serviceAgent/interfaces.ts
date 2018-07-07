import {
  RegisterInfo,
  LoginCredentials,
  UserComplete,
  Message,
  FriendBasic,
  ChatBasic,
  AddFriendRequest,
  GroupInvitation,
} from '@/models';
import _Vue from 'vue';

/**
 * @description
 * fastchat-fe使用这个接口的API来进行数据通讯。
 * 一个例子是 /src/serviceAgent/FastChatSEAgent/FastChatSEAgent.ts
 * 如果想要使用另一套服务器API，开发者需要自己编写一个类，实现这个接口（以及ServiceAgentVuePlugin），然后Vue.use(MyServiceAgent)。
 */
export interface ServiceAgent extends
  SessionService,
  UserService,
  FriendService,
  ChatService,
  UpdateService {
}

export abstract class ServiceAgentVuePlugin {
  /**
   * @description 这个类实现了Vue插件的接口，可以 Vue.use(MyServiceAgent)。
   */
  public install(vue: typeof _Vue, options?: any) {
    vue.serviceAgent = this as any;
    vue.prototype.$serviceAgent = this as any;
  }
}

export interface Response<Data> {
  success: boolean;
  msg: string;
  data: Data;
}

interface SessionService {
  /**
   * @description 登陆成功将直接跳转到主页，不管成功还是失败都展示message
   */
  login(loginCredentials: LoginCredentials): Promise<Response<UserComplete>>;
  logout(): Promise<Response<undefined>>;
  tryResumeSession(): UserComplete | null;
}

interface UserService {
  /**
   * @description 注册成功将直接跳转到登陆，不管成功还是失败都展示message
   */
  register(registerInfo: RegisterInfo): Promise<Response<undefined>>;
  findUser(contain: string): Promise<Response<UserComplete[]>>;
  changeUserInfo(info: UserComplete): Promise<Response<undefined>>;
  changePassword(userName: string, oldP: string, newP: string): Promise<Response<undefined>>;
}

interface FriendService {
  getFriends(): Promise<Response<FriendBasic[]>>;
  requestAddFriend(targetUserName: string, msg: string): Promise<Response<undefined>>;
  getFriendRequests(): Promise<Response<AddFriendRequest[]>>;
  responseFriendRequest(reqId: string, accept: boolean): Promise<Response<undefined>>;
}

interface ChatService {
  getChats(): Promise<Response<ChatBasic[]>>;
  getChatMessages(chatId: string): Promise<Response<Message[]>>;
  getChatMembers(chatId: string): Promise<Response<UserComplete[]>>;
  sendMessage(chatId: string, from: string, content: string): Promise<Response<Message>>;
  createGroupChat(): Promise<Response<ChatBasic>>;
  postGroupInvitation(friendName: string, chatId: string, message: string): Promise<Response<undefined>>;
  getGroupInvitations(): Promise<Response<GroupInvitation[]>>;
  responseGroupInvitation(invId: string, accept: boolean): Promise<Response<undefined>>;
  changeGroupChatName(chatId: string, newChatName: string): Promise<Response<undefined>>;
  deleteGroupMember(chatId: string, userName: string): Promise<Response<undefined>>;
}

/**
 * @description
 * fastchat-fe不知道数据什么时候会更新，需要ServiceAgent的实现者来通知它。
 * 通知的方式是，当ServiceAgent发现数据更新时，调用对应的回调函数。
 * 比如，发现有新消息时要调用chatListUpdate。
 *
 * 以chatListUpdate为例子：
 * fastchat-fe会调用registerUpdateCallback来注册回调函数chatListUpdate（订阅chatList的更新），
 * 由ServiceAgent的实现者来决定什么时候调用chatListUpdate。
 * ServiceAgent的实现者可以通过很多种方式来发现数据更新。比如轮询、websocket、server push……
 * 不管通过什么方法，在发现“增加删除chat，以及有chat的chatName发生改变、lastestMessage改变”时，
 * 就要调用chatListUpdate来通知fastchat-fe响应数据的更新。
 */
interface UpdateService {
  subscribeUpdate(
    // 登陆用户的基本信息发生改变
    userUpdate: (user: UserComplete) => void,
    // 增加删除好友，以及有好友的基本信息发生改变
    friendListUpdate: (friends: FriendBasic[]) => void,
    // 增加删除chat，以及有chat的chatName发生改变、lastestMessage改变
    chatListUpdate: (chats: ChatBasic[]) => void,
    // 某个chat的成员数量、成员信息发生改变
    oneChatMembersUpdate: (members: UserComplete[]) => void,
  ): void;
  unsubscribeUpdate(): void;
}
