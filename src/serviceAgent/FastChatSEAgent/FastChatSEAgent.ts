import { RegisterInfo, LoginCredentials, UserName, UserComplete, Message } from '@/models';
import { ServiceAgent, ServiceAgentVuePlugin, Response } from '@/serviceAgent';
import { sessionRS, usersRS, friendsRS, configJWTHeader } from '@/serviceAgent/FastChatSEAgent';

export class FastChatSEAgent extends ServiceAgentVuePlugin implements ServiceAgent {

  public async login(loginCredentials: LoginCredentials): Promise<Response<UserComplete>> {
    const res = await sessionRS
      .post<Response<{ userInfo: UserComplete, jwt: string }>>('', loginCredentials);
    const { msg, success, data } = res.data;
    const { jwt, userInfo } = data;
    configJWTHeader(jwt);
    return { msg, success, data: userInfo };
  }

  public async logout(): Promise<Response<undefined>> {
    configJWTHeader('');
    return {
      success: true,
      msg: 'ok',
      data: undefined,
    };
  }

  public async register(registerInfo: RegisterInfo): Promise<Response<undefined>> {
    const res = await usersRS.post('', registerInfo);
    return res.data;
  }
  public async getFriendList(): Promise<Response<UserComplete[]>> {
    const res = await friendsRS.get('');
    return res.data;
  }
  public requestAddFriend(target: UserName): Promise<Response<undefined>> { return 0 as any; }
  public getMessageFromFriend(): Promise<Response<Message[]>> { return 0 as any; }
}
