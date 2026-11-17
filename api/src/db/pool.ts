import mysql from 'mysql2/promise';
import { config } from '../config';

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  timezone: 'Z',
});

export async function closePool(): Promise<void> {
  await pool.end();
}
