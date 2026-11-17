import { Db } from '../db/db';
import { Account, AccountStatus, AccountType } from '../domain/models';

interface AccountRow {
  id: number;
  user_id: number;
  iban: string;
  type: AccountType;
  name: string;
  balance: number;
  overdraft_limit: number;
  status: AccountStatus;
  created_at: Date;
  closed_at: Date | null;
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    userId: row.user_id,
    iban: row.iban,
    type: row.type,
    name: row.name,
    balance: row.balance,
    overdraftLimit: row.overdraft_limit,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  };
}

export interface NewAccount {
  userId: number;
  iban: string;
  type: AccountType;
  name: string;
}

export class AccountRepository {
  constructor(private readonly db: Db) {}

  async findById(id: number): Promise<Account | null> {
    const rows = await this.db.select<AccountRow>('SELECT * FROM accounts WHERE id = ?', [id]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  async findOwned(id: number, userId: number): Promise<Account | null> {
    const rows = await this.db.select<AccountRow>('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [
      id,
      userId,
    ]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  async findByIban(iban: string): Promise<Account | null> {
    const rows = await this.db.select<AccountRow>('SELECT * FROM accounts WHERE iban = ?', [iban]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  async listByUser(userId: number): Promise<Account[]> {
    const rows = await this.db.select<AccountRow>(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY status ASC, created_at ASC, id ASC',
      [userId],
    );
    return rows.map(toAccount);
  }

  async countActiveByUser(userId: number): Promise<number> {
    const rows = await this.db.select<{ count: number }>(
      "SELECT COUNT(*) AS count FROM accounts WHERE user_id = ? AND status = 'active'",
      [userId],
    );
    return Number(rows[0].count);
  }

  async create(account: NewAccount): Promise<number> {
    const result = await this.db.execute('INSERT INTO accounts (user_id, iban, type, name) VALUES (?, ?, ?, ?)', [
      account.userId,
      account.iban,
      account.type,
      account.name,
    ]);
    return result.insertId;
  }

  async close(id: number): Promise<void> {
    await this.db.execute("UPDATE accounts SET status = 'closed', closed_at = NOW() WHERE id = ?", [id]);
  }

  async setBalance(id: number, balance: number): Promise<void> {
    await this.db.execute('UPDATE accounts SET balance = ? WHERE id = ?', [balance, id]);
  }

  async addToBalance(id: number, amount: number): Promise<void> {
    await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, id]);
  }

  /** Débite le compte si le découvert autorisé le permet. Retourne false sinon. */
  async withdrawWithinOverdraft(id: number, amount: number): Promise<boolean> {
    const result = await this.db.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance - ? >= -overdraft_limit',
      [amount, id, amount],
    );
    return result.affectedRows > 0;
  }
}
