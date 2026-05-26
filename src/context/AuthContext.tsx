import { createContext, ReactNode, useContext, useEffect } from 'react';
import { AuthResult } from '../types/auth';
import { tokenStore } from '../services/auth/tokenStore';
import { registerUnauthorizedHandler } from '../services/api/client';

type AuthContextValue = {
  auth: AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  auth: AuthResult;
  children: ReactNode;
  logout: () => void;
};

export function AuthProvider({ auth, children, logout }: AuthProviderProps) {
  useEffect(() => {
    tokenStore.set(auth.token);
    registerUnauthorizedHandler(logout);
    return () => { tokenStore.clear(); };
  }, [auth.token, logout]);

  return <AuthContext.Provider value={{ auth, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
