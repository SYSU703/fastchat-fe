import { RegisterInfo, LoginCredentials, UserBasic, UserComplete, Message } from '@/models';
import _Vue from 'vue';

/**
 * @description 开发者需要自己编写一个类，entends这个抽象类。
 * fastchat-fe使用这个抽象类的API来进行数据通讯。
 * 一个例子是 /src/serviceAgent/FastChatSEAgent/FastChatSEAgent.ts
 */
export abstract class ServiceAgent implements
  SessionService,
  UserService,
  FriendsService,
  MessageService {

  /**
   * @description 这个类实现了Vue插件的接口，可以 Vue.use(MyServiceAgent)。
   */
  public install(vue: typeof _Vue, options?: any) {
    vue.serviceAgent = this;
    vue.prototype.$serviceAgent = this;
  }
  public abstract login(loginCredentials: LoginCredentials): Promise<Response<undefined>>;
  public abstract register(registerInfo: RegisterInfo): Promise<Response<undefined>>;
  public abstract getFriendList(): Promise<Response<UserComplete[]>>;
  public abstract requestAddFriend(target: UserBasic): Promise<Response<undefined>>;
  public abstract getMessageFromFriend(): Promise<Response<Message[]>>;
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
  login(loginCredentials: LoginCredentials): Promise<Response<undefined>>;
}

interface UserService {
  /**
   * @description 注册成功将直接跳转到登陆，不管成功还是失败都展示message
   */
  register(registerInfo: RegisterInfo): Promise<Response<undefined>>;
}

interface FriendsService {
  getFriendList(): Promise<Response<UserComplete[]>>;
  requestAddFriend(target: UserBasic): Promise<Response<undefined>>;

}

interface MessageService {
  getMessageFromFriend(): Promise<Response<Message[]>>;
}


