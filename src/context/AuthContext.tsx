import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthResult, AuthUser } from '../types/auth';
import { tokenStore } from '../services/auth/tokenStore';
import { registerUnauthorizedHandler } from '../services/api/client';
import { registerPushToken } from '../services/notifications/notificationService';

type AuthContextValue = {
  auth: AuthResult;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  auth: AuthResult;
  children: ReactNode;
  logout: () => void;
};

export function AuthProvider({ auth, children, logout }: AuthProviderProps) {
  const [currentAuth, setCurrentAuth] = useState(auth);

  useEffect(() => {
    tokenStore.set(auth.token);
    registerUnauthorizedHandler(logout);
    return () => { tokenStore.clear(); };
  }, [auth.token, logout]);

  useEffect(() => {
    setCurrentAuth(auth);
  }, [auth]);

  useEffect(() => {
    void registerPushToken().catch(() => {});
  }, [currentAuth.token]);

  const updateUser = (user: AuthUser) => {
    setCurrentAuth((previous) => ({ ...previous, user: { ...user, token: previous.token } }));
  };

  return <AuthContext.Provider value={{ auth: currentAuth, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
