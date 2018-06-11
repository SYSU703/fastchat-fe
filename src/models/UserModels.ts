export interface User {
  userName: string;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface UserState {
  currentUser: User | null;
}
