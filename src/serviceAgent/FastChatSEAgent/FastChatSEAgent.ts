import { RegisterInfo, LoginCredentials, UserBasic, UserComplete, Message } from '@/models';
import { ServiceAgent, ServiceAgentVuePlugin, Response } from '@/serviceAgent';
import { sessionRS, usersRS, configJWTHeader } from '@/serviceAgent/FastChatSEAgent';

export class FastChatSEAgent extends ServiceAgentVuePlugin implements ServiceAgent {

  public async login(loginCredentials: LoginCredentials): Promise<Response<UserComplete>> {
    const res = await sessionRS
      .post<Response<{ userInfo: UserComplete, jwt: string }>>('', loginCredentials);
    const { msg, success, data } = res.data;
    const { jwt, userInfo } = data;
    configJWTHeader(jwt);
    return { msg, success, data: userInfo };
  }

  public async register(registerInfo: RegisterInfo): Promise<Response<undefined>> {
    const res = await usersRS.post('', registerInfo);
    return res.data;
  }
  public getFriendList(): Promise<Response<UserComplete[]>> { return 0 as any; }
  public requestAddFriend(target: UserBasic): Promise<Response<undefined>> { return 0 as any; }
  public getMessageFromFriend(): Promise<Response<Message[]>> { return 0 as any; }
}
