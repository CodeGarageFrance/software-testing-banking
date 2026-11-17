import { Db } from '../db/db';
import { MonthlySummary, TransactionListItem, TransactionType } from '../domain/models';

export interface NewTransaction {
  accountId: number;
  type: TransactionType;
  amount: number;
  label: string | null;
  counterpartyAccountId?: number | null;
}

export interface TransactionPageQuery {
  sort: string;
  order: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

interface TransactionListRow {
  id: number;
  type: TransactionType;
  amount: number;
  label: string | null;
  counterparty_iban: string | null;
  created_at: Date;
}

interface SummaryRow {
  year: number;
  month: number;
  total_in: number | string;
  total_out: number | string;
  operations: number | string;
}

export class TransactionRepository {
  constructor(private readonly db: Db) {}

  async create(tx: NewTransaction): Promise<number> {
    const result = await this.db.execute(
      `INSERT INTO transactions (account_id, type, amount, label, counterparty_account_id)
       VALUES (?, ?, ?, ?, ?)`,
      [tx.accountId, tx.type, tx.amount, tx.label, tx.counterpartyAccountId ?? null],
    );
    return result.insertId;
  }

  async findPage(accountId: number, query: TransactionPageQuery): Promise<TransactionListItem[]> {
    const rows = await this.db.select<TransactionListRow>(
      `SELECT t.id, t.type, t.amount, t.label, t.created_at, c.iban AS counterparty_iban
         FROM transactions t
         LEFT JOIN accounts c ON c.id = t.counterparty_account_id
        WHERE t.account_id = ?
        ORDER BY t.${query.sort} ${query.order}, t.id ${query.order}
        LIMIT ? OFFSET ?`,
      [accountId, query.limit, query.offset],
    );
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      label: r.label,
      counterpartyIban: r.counterparty_iban,
      createdAt: r.created_at,
    }));
  }

  async countByAccount(accountId: number): Promise<number> {
    const rows = await this.db.select<{ total: number }>(
      'SELECT COUNT(*) AS total FROM transactions WHERE account_id = ?',
      [accountId],
    );
    return Number(rows[0].total);
  }

  /** Somme des virements émis par l'utilisateur vers d'autres clients sur les `hours` dernières heures. */
  async sumExternalTransfersSince(userId: number, hours: number): Promise<number> {
    const rows = await this.db.select<{ total: number | string }>(
      `SELECT COALESCE(SUM(t.amount), 0) AS total
         FROM transactions t
         JOIN accounts a ON a.id = t.account_id
         JOIN accounts c ON c.id = t.counterparty_account_id
        WHERE a.user_id = ?
          AND c.user_id <> ?
          AND t.type = 'transfer_out'
          AND t.created_at >= NOW() - INTERVAL ? HOUR`,
      [userId, userId, hours],
    );
    return Number(rows[0].total);
  }

  async monthlySummary(accountId: number, months: number): Promise<MonthlySummary[]> {
    const rows = await this.db.select<SummaryRow>(
      `SELECT year, month, total_in, total_out, operations
         FROM v_monthly_summary
        WHERE account_id = ?
        ORDER BY year DESC, month DESC
        LIMIT ?`,
      [accountId, months],
    );
    return rows.map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      totalIn: Number(r.total_in),
      totalOut: Number(r.total_out),
      operations: Number(r.operations),
    }));
  }
}
