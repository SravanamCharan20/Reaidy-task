import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [booting, setBooting] = useState(true);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setStoredToken('');
    setStoredUser(null);
  }, []);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setStoredToken(nextToken);
    setStoredUser(nextUser);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    const me = await api.me();
    setUser(me.user);
    setStoredUser(me.user);
  }, [token]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (token) await refresh();
      } catch {
        if (alive) logout();
      } finally {
        if (alive) setBooting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, refresh, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      isAuthed: Boolean(token && user),
      setSession,
      logout,
      refresh
    }),
    [token, user, booting, setSession, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

