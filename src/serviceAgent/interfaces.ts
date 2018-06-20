import {
  RegisterInfo,
  LoginCredentials,
  UserName,
  UserComplete,
  Message,
  Friend,
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
  ChatService {
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
}

interface UserService {
  /**
   * @description 注册成功将直接跳转到登陆，不管成功还是失败都展示message
   */
  register(registerInfo: RegisterInfo): Promise<Response<undefined>>;
}

interface FriendService {
  getFriendList(): Promise<Response<Friend[]>>;
  requestAddFriend(target: UserName): Promise<Response<undefined>>;

}

interface ChatService {
  getChatMessages(chatId: string): Promise<Response<Message[]>>;
  getChatMembers(chatId: string): Promise<Response<UserComplete[]>>;
}


