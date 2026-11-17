export type AccountType = 'checking' | 'savings';
export type AccountStatus = 'active' | 'closed';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dailyTransferLimit: number;
  createdAt: Date;
}

export interface Account {
  id: number;
  userId: number;
  iban: string;
  type: AccountType;
  name: string;
  balance: number;
  overdraftLimit: number;
  status: AccountStatus;
  createdAt: Date;
  closedAt: Date | null;
}

export interface TransactionListItem {
  id: number;
  type: TransactionType;
  amount: number;
  label: string | null;
  counterpartyIban: string | null;
  createdAt: Date;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIn: number;
  totalOut: number;
  operations: number;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    dailyTransferLimit: user.dailyTransferLimit,
    createdAt: user.createdAt,
  };
}

export type AccountDto = Omit<Account, 'userId'>;

export function toAccountDto(account: Account): AccountDto {
  return {
    id: account.id,
    iban: account.iban,
    type: account.type,
    name: account.name,
    balance: account.balance,
    overdraftLimit: account.overdraftLimit,
    status: account.status,
    createdAt: account.createdAt,
    closedAt: account.closedAt,
  };
}
