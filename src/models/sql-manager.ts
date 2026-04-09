import { dbPool } from '../core/storage/db.sql.js';
import type { iFriend } from './friend.model.js';

interface FriendDbRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  balance: number | string;
  isDeleted: number | boolean;
}

export class SQLManager {
  private static instance: SQLManager;

  private constructor() {}

  public static getInstance(): SQLManager {
    if (!SQLManager.instance) {
      SQLManager.instance = new SQLManager();
    }
    return SQLManager.instance;
  }

  public async initializeDatabase(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS friends (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(255) DEFAULT NULL,
        balance DECIMAL(10, 2) DEFAULT 0,
        isDeleted BOOLEAN DEFAULT FALSE
      )
    `;
    await dbPool.query(createTableQuery);
  }

  public async getAllFriends(): Promise<iFriend[]> {
    const [rows] = await dbPool.query(
      'SELECT * FROM friends WHERE isDeleted = FALSE',
    );
    return (rows as FriendDbRow[]).map((row) => this.mapRowToFriend(row));
  }

  public async insertFriend(friend: iFriend): Promise<void> {
    const query = `
      INSERT INTO friends (id, name, email, phone, balance, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await dbPool.execute(query, [
      friend.id,
      friend.name,
      friend.email ?? null,
      friend.phone ?? null,
      friend.balance,
      friend.isDeleted ?? false,
    ]);
  }

  public async getFriendByEmail(email: string): Promise<iFriend | undefined> {
    const [rows] = await dbPool.query(
      'SELECT * FROM friends WHERE email = ? AND isDeleted = FALSE LIMIT 1',
      [email],
    );
    const friends = rows as FriendDbRow[];
    const friend = friends[0];
    return friend ? this.mapRowToFriend(friend) : undefined;
  }

  public async getFriendByPhone(phone: string): Promise<iFriend | undefined> {
    const [rows] = await dbPool.query(
      'SELECT * FROM friends WHERE phone = ? AND isDeleted = FALSE LIMIT 1',
      [phone],
    );
    const friends = rows as FriendDbRow[];
    const friend = friends[0];
    return friend ? this.mapRowToFriend(friend) : undefined;
  }

  public async getFriendByName(name: string): Promise<iFriend | undefined> {
    const [rows] = await dbPool.query(
      'SELECT * FROM friends WHERE LOWER(name) = LOWER(?) AND isDeleted = FALSE LIMIT 1',
      [name],
    );
    const friends = rows as FriendDbRow[];
    const friend = friends[0];
    return friend ? this.mapRowToFriend(friend) : undefined;
  }

  public async getFriendById(id: string): Promise<iFriend | undefined> {
    const [rows] = await dbPool.query(
      'SELECT * FROM friends WHERE id = ? AND isDeleted = FALSE LIMIT 1',
      [id],
    );
    const friends = rows as FriendDbRow[];
    const friend = friends[0];
    return friend ? this.mapRowToFriend(friend) : undefined;
  }

  public async updateFriend(friend: iFriend): Promise<void> {
    const query = `
      UPDATE friends 
      SET name = ?, email = ?, phone = ?, balance = ?, isDeleted = ?
      WHERE id = ?
    `;
    await dbPool.execute(query, [
      friend.name,
      friend.email ?? null,
      friend.phone ?? null,
      friend.balance,
      friend.isDeleted ?? false,
      friend.id,
    ]);
  }

  public async softDeleteFriend(id: string): Promise<void> {
    await dbPool.execute('UPDATE friends SET isDeleted = TRUE WHERE id = ?', [
      id,
    ]);
  }

  public async hardDeleteFriend(id: string): Promise<void> {
    await dbPool.execute('DELETE FROM friends WHERE id = ?', [id]);
  }

  public async searchFriends(
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ data: iFriend[]; total: number; matched: number }> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const sqlSearch = `
      SELECT * FROM friends 
      WHERE isDeleted = FALSE 
      AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?)
    `;

    // Matched result count
    const [filteredRows] = await dbPool.query(sqlSearch, [
      lowerQuery,
      lowerQuery,
      lowerQuery,
    ]);
    const matched = (filteredRows as FriendDbRow[]).length;

    // Paginated result
    const sqlPaged =
      sqlSearch + ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    const [pagedRows] = await dbPool.query(sqlPaged, [
      lowerQuery,
      lowerQuery,
      lowerQuery,
    ]);

    // Total count
    const [totalRows] = await dbPool.query(
      'SELECT COUNT(*) as count FROM friends WHERE isDeleted = FALSE',
    );
    const total = (totalRows as { count: number }[])[0]?.count || 0;

    return {
      data: (pagedRows as FriendDbRow[]).map((row) => this.mapRowToFriend(row)),
      matched,
      total,
    };
  }

  private mapRowToFriend(row: FriendDbRow): iFriend {
    const friend: iFriend = {
      id: row.id,
      name: row.name,
      balance: Number(row.balance),
      isDeleted: Boolean(row.isDeleted),
    };
    if (row.email) friend.email = row.email;
    if (row.phone) friend.phone = row.phone;
    return friend;
  }
}
