import { RegisterInfo, LoginCredentials, UserBasic, UserComplete, Message } from '@/models';
import { ServiceAgent, Response } from '@/serviceAgent';
import { sessionRS, usersRS } from '@/serviceAgent/FastChatSEAgent';

export class FastChatSEAgent extends ServiceAgent {
  constructor() {
    super();
  }

  public async login(loginCredentials: LoginCredentials): Promise<Response<undefined>> {
    const res = await sessionRS.post<Response<undefined>>('', loginCredentials);
    return res.data;
  }
  public async register(registerInfo: RegisterInfo): Promise<Response<undefined>> {
    const res = await usersRS.post('', registerInfo);
    return res.data;
  }
  public getFriendList(): Promise<Response<UserComplete[]>> { return 0 as any; }
  public requestAddFriend(target: UserBasic): Promise<Response<undefined>> { return 0 as any; }
  public getMessageFromFriend(): Promise<Response<Message[]>> { return 0 as any; }
}
