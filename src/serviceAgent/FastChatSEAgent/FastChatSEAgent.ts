import { RegisterInfo, LoginCredentials, UserName, UserComplete, Message } from '@/models';
import { ServiceAgent, ServiceAgentVuePlugin, Response } from '@/serviceAgent';
import {
  configJWTHeader,
  sessionRS,
  usersRS,
  friendsRS,
  chatsRS,
} from '@/serviceAgent/FastChatSEAgent';

export class FastChatSEAgent extends ServiceAgentVuePlugin implements ServiceAgent {

  public async login(loginCredentials: LoginCredentials) {
    const res = await sessionRS
      .post<Response<{ userInfo: UserComplete, jwt: string }>>('', loginCredentials);
    const { msg, success, data } = res.data;
    const { jwt, userInfo } = data;
    configJWTHeader(jwt);
    return { msg, success, data: userInfo };
  }

  public async logout() {
    configJWTHeader('');
    return {
      success: true,
      msg: 'ok',
      data: undefined,
    };
  }

  public async register(registerInfo: RegisterInfo) {
    const res = await usersRS.post('', registerInfo);
    return res.data;
  }
  public async getFriendList() {
    const res = await friendsRS.get('');
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
}
