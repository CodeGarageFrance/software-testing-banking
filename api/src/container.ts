import { Pool } from 'mysql2/promise';
import { createDb } from './db/db';
import { pool as defaultPool } from './db/pool';
import { createMysqlUnitOfWork } from './db/unitOfWork';
import { createRepositories } from './repositories';
import { AccountService } from './services/accountService';
import { AuthService } from './services/authService';
import { ProfileService } from './services/profileService';
import { TransferService } from './services/transferService';

export interface AppServices {
  auth: AuthService;
  profile: ProfileService;
  accounts: AccountService;
  transfers: TransferService;
}

/** Assemble repositories et services (injection de dépendances manuelle). */
export function createServices(pool: Pool = defaultPool): AppServices {
  const { users, accounts, transactions } = createRepositories(createDb((sql, params) => pool.query(sql, params)));
  const unitOfWork = createMysqlUnitOfWork(pool);

  return {
    auth: new AuthService(users, accounts),
    profile: new ProfileService(users, accounts),
    accounts: new AccountService(accounts, transactions, unitOfWork),
    transfers: new TransferService(unitOfWork),
  };
}
