import { query } from '../core/storage/db.sql.js';

export async function initDB(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS friends (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
      isDeleted TINYINT(1) NOT NULL DEFAULT 0
    )
  `);
}
