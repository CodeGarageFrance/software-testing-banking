import { Db } from '../db/db';
import { AccountRepository } from './accountRepository';
import { TransactionRepository } from './transactionRepository';
import { UserRepository } from './userRepository';

export { AccountRepository, TransactionRepository, UserRepository };

export interface Repositories {
  users: UserRepository;
  accounts: AccountRepository;
  transactions: TransactionRepository;
}

export function createRepositories(db: Db): Repositories {
  return {
    users: new UserRepository(db),
    accounts: new AccountRepository(db),
    transactions: new TransactionRepository(db),
  };
}
