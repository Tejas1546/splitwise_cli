import mysql from 'mysql2/promise';

export type ExecuteValues =
  | string
  | number
  | boolean
  | Date
  | null
  | Buffer
  | ExecuteValues[]
  | { [key: string]: ExecuteValues };

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env['DB_HOST'] ?? 'localhost',
      port: Number(process.env['DB_PORT'] ?? 3306),
      user: process.env['DB_USER'] ?? 'root',
      password: process.env['DB_PASSWORD'] ?? 'root',
      database: process.env['DB_NAME'] ?? 'splitwise',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function query<T>(
  sql: string,
  params?: ExecuteValues,
): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
