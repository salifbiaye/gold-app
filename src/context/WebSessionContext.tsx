import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthCredentials, AuthUser } from '../types/auth';
import { webAuthService } from '../services/auth/webAuthService';

export type SessionStatus = 'anonymous' | 'authenticating' | 'authenticated' | 'expired';

type WebSessionValue = {
  login(credentials: AuthCredentials): Promise<void>;
  logout(): Promise<void>;
  status: SessionStatus;
  updateUser(user: AuthUser): void;
  user: AuthUser | null;
};

const WebSessionContext = createContext<WebSessionValue | null>(null);

export function WebSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('authenticating');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;
    void webAuthService.restoreSession().then((restoredUser) => {
      if (!mounted) return;
      setUser(restoredUser);
      setStatus(restoredUser ? 'authenticated' : 'anonymous');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<WebSessionValue>(() => ({
    status,
    user,
    async login(credentials) {
      setStatus('authenticating');
      try {
        const authenticatedUser = await webAuthService.login(credentials);
        setUser(authenticatedUser);
        setStatus('authenticated');
      } catch (error) {
        setStatus('anonymous');
        throw error;
      }
    },
    async logout() {
      await webAuthService.logout();
      setUser(null);
      setStatus('anonymous');
    },
    updateUser(nextUser) {
      setUser(nextUser);
    },
  }), [status, user]);

  return <WebSessionContext.Provider value={value}>{children}</WebSessionContext.Provider>;
}

export function useWebSession() {
  const context = useContext(WebSessionContext);
  if (!context) throw new Error('useWebSession must be used inside WebSessionProvider');
  return context;
}
