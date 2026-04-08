import type { ExecuteValues } from './db.sql.js';
import { query } from './db.sql.js';
import type { iFriend } from '../../models/friend.model.js';

export const friendsQueries = {
  getAll: () => query<iFriend[]>('SELECT * FROM friends WHERE isDeleted = 0'),

  insert: (f: iFriend) =>
    query(
      'INSERT INTO friends (id, name, email, phone, balance, isDeleted) VALUES (?, ?, ?, ?, ?, 0)',
      [f.id, f.name, f.email ?? null, f.phone ?? null, f.balance],
    ),

  findByEmail: (email: string) =>
    query<iFriend[]>(
      'SELECT * FROM friends WHERE isDeleted = 0 AND email = ?',
      [email],
    ).then((r) => r[0]),

  findByPhone: (phone: string) =>
    query<iFriend[]>(
      'SELECT * FROM friends WHERE isDeleted = 0 AND phone = ?',
      [phone],
    ).then((r) => r[0]),

  findByName: (name: string) =>
    query<iFriend[]>(
      'SELECT * FROM friends WHERE isDeleted = 0 AND LOWER(name) = LOWER(?)',
      [name],
    ).then((r) => r[0]),

  findById: (id: string) =>
    query<iFriend[]>('SELECT * FROM friends WHERE isDeleted = 0 AND id = ?', [
      id,
    ]).then((r) => r[0]),

  update: (id: string, fields: string, values: ExecuteValues) =>
    query(`UPDATE friends SET ${fields} WHERE id = ?`, values),

  softDelete: (id: string) =>
    query('UPDATE friends SET isDeleted = 1 WHERE id = ?', [id]),

  hardDelete: (id: string) => query('DELETE FROM friends WHERE id = ?', [id]),

  search: (like: string) =>
    query<iFriend[]>(
      `SELECT * FROM friends WHERE isDeleted = 0
       AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?)`,
      [like, like, like],
    ),
};
