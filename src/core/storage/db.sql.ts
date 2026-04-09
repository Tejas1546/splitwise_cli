import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

class MySQLDatabase {
  private static instance: MySQLDatabase;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  public static getInstance(): MySQLDatabase {
    if (!MySQLDatabase.instance) {
      MySQLDatabase.instance = new MySQLDatabase();
    }
    return MySQLDatabase.instance;
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }
}

export const dbPool = MySQLDatabase.getInstance().getPool();
