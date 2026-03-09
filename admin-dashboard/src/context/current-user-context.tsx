'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CurrentUser } from '@/types/auth';
import { getCurrentUserFromToken } from '@/utils/jwt';

type CurrentUserContextType = {
  currentUser: CurrentUser | null;
  refreshFromStorage: () => void;
  setFromToken: (token: string) => void;
  clear: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'current_user';

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const refreshFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_id_token') || localStorage.getItem('auth_token');
    if (token) {
      const user = getCurrentUserFromToken(token);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return;
      }
    }

    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CurrentUser;
        setCurrentUser(parsed);
        return;
      } catch {
        // fall through to clear
      }
    }

    setCurrentUser(null);
  }, []);

  const setFromToken = useCallback((token: string) => {
    if (typeof window === 'undefined') return;
    const user = getCurrentUserFromToken(token);
    if (!user) return;
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  const value = useMemo(
    () => ({
      currentUser,
      refreshFromStorage,
      setFromToken,
      clear,
    }),
    [currentUser, refreshFromStorage, setFromToken, clear]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used inside CurrentUserProvider');
  }
  return ctx;
}

