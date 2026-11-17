import { ResultSetHeader } from 'mysql2';

/**
 * Abstraction minimale au-dessus de mysql2, utilisée par les repositories.
 * Elle peut envelopper le pool (requêtes indépendantes) ou une connexion (transaction).
 */
export interface Db {
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ insertId: number; affectedRows: number }>;
}

type QueryFn = (sql: string, params: unknown[]) => Promise<[unknown, unknown]>;

export function createDb(query: QueryFn): Db {
  return {
    async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const [rows] = await query(sql, params);
      return rows as T[];
    },
    async execute(sql: string, params: unknown[] = []) {
      const [result] = await query(sql, params);
      const header = result as ResultSetHeader;
      return { insertId: header.insertId, affectedRows: header.affectedRows };
    },
  };
}
