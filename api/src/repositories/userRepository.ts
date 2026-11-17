import { Db } from '../db/db';
import { User } from '../domain/models';

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  daily_transfer_limit: number;
  created_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    dailyTransferLimit: row.daily_transfer_limit,
    createdAt: row.created_at,
  };
}

export interface NewUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export class UserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: number): Promise<User | null> {
    const rows = await this.db.select<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select<UserRow>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async create(user: NewUser): Promise<number> {
    const result = await this.db.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [user.email, user.passwordHash, user.firstName, user.lastName],
    );
    return result.insertId;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}
