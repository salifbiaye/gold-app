export type AuthCredentials = {
  identifier: string;
  password: string;
};

export type AuthUser = {
  email: string;
  fullName: string;
  id: string;
  phone: string;
  token: string;
  avatarUrl?: string | null;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};
