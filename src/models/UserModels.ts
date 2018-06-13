export interface RegisterInfo extends UserComplete {
  password: string;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

/**
 * @description 用于在调用后端API时标识一个用户
 */
export interface UserBasic {
  userName: string;
}

/**
 * @description 用于在用户界面上展示一个用户
 */
export interface UserComplete extends UserBasic {
  nickname: string;
  email: string;
  gender: string;
}

/**
 * @description 当前登陆用户的状态(null表示尚未登录)
 */
export type CurrentUser = UserComplete | null;

