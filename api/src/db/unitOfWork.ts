import { Pool } from 'mysql2/promise';
import { createRepositories, Repositories } from '../repositories';
import { createDb } from './db';

/**
 * Exécute `work` dans une transaction SQL : commit si tout se passe bien, rollback sinon.
 * Les repositories fournis partagent la même connexion.
 */
export type UnitOfWork = <T>(work: (repos: Repositories) => Promise<T>) => Promise<T>;

export function createMysqlUnitOfWork(pool: Pool): UnitOfWork {
  return async <T>(work: (repos: Repositories) => Promise<T>): Promise<T> => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const repos = createRepositories(createDb((sql, params) => conn.query(sql, params)));
      const result = await work(repos);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  };
}
