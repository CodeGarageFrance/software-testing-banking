import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Account, api } from '../api';
import { useAuth } from '../auth/AuthContext';

interface AccountsContextValue {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextValue | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await api.listAccounts());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAccounts([]);
    refresh();
  }, [token, refresh]);

  const value = useMemo(() => ({ accounts, loading, error, refresh }), [accounts, loading, error, refresh]);

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts(): AccountsContextValue {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error('useAccounts doit être utilisé dans un <AccountsProvider>');
  return ctx;
}
