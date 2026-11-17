import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, SignupData, tokenStorage, User } from '../api';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token || user) return;
    api
      .me()
      .then(setUser)
      .catch(() => {
        tokenStorage.clear();
        setToken(null);
      });
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const res = await api.signup(data);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return ctx;
}
