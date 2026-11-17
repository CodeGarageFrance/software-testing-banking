export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dailyTransferLimit: number;
  createdAt: string;
}

export type AccountType = 'checking' | 'savings';

export interface Account {
  id: number;
  iban: string;
  type: AccountType;
  name: string;
  balance: number;
  overdraftLimit: number;
  status: 'active' | 'closed';
  createdAt: string;
  closedAt: string | null;
  projectedInterest12Months?: number | null;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  label: string | null;
  counterpartyIban: string | null;
  createdAt: string;
}

export interface TransactionPage {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  items: Transaction[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIn: number;
  totalOut: number;
  operations: number;
}

export interface TransferResult {
  amount: number;
  fee: number;
  fromAccountId: number;
  toIban: string;
  balanceAfter: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const TOKEN_KEY = 'bank_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Une erreur inattendue est survenue');
  }
  return data as T;
}

export const api = {
  signup: (data: SignupData) => request<AuthResponse>('/auth/signup', { method: 'POST', body: data }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request<User>('/me'),
  deleteMe: () => request<void>('/me', { method: 'DELETE' }),

  listAccounts: () => request<Account[]>('/accounts'),
  createAccount: (type: AccountType, name: string) =>
    request<Account>('/accounts', { method: 'POST', body: { type, name } }),
  getAccount: (id: number) => request<Account>(`/accounts/${id}`),
  closeAccount: (id: number) => request<Account>(`/accounts/${id}`, { method: 'DELETE' }),
  deposit: (id: number, amount: number) =>
    request<Account>(`/accounts/${id}/deposit`, { method: 'POST', body: { amount } }),
  withdraw: (id: number, amount: number) =>
    request<Account>(`/accounts/${id}/withdraw`, { method: 'POST', body: { amount } }),
  listTransactions: (id: number, params: { page: number; sort: string; order: 'asc' | 'desc' }) =>
    request<TransactionPage>(
      `/accounts/${id}/transactions?page=${params.page}&sort=${params.sort}&order=${params.order}`,
    ),
  getSummary: (id: number) => request<MonthlySummary[]>(`/accounts/${id}/summary`),

  transfer: (data: { fromAccountId: number; toIban: string; amount: number; label?: string }) =>
    request<TransferResult>('/transfers', { method: 'POST', body: data }),
};
