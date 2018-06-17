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
export type UserName = string;

/**
 * @description 用于在用户界面上展示一个用户
 */
export interface UserComplete {
  userName: UserName;
  nickname: string;
  email: string;
  gender: string;
}

