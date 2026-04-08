import { friendsQueries } from '../core/storage/friends.queries.sql.js';
import type { iFriend } from '../models/friend.model.js';
import type { PageOptions, PageResult } from '../core/page-options.js';

export class FriendRepository {
  private static instance: FriendRepository;

  static getInstance() {
    if (!FriendRepository.instance)
      FriendRepository.instance = new FriendRepository();
    return FriendRepository.instance;
  }

  getAllFriends() {
    return friendsQueries.getAll();
  }
  addFriend(friend: iFriend) {
    return friendsQueries.insert(friend);
  }
  findFriendByEmail(email: string) {
    return friendsQueries.findByEmail(email);
  }
  findFriendByPhone(phone: string) {
    return friendsQueries.findByPhone(phone);
  }
  findFriendByName(name: string) {
    return friendsQueries.findByName(name);
  }
  findFriendById(id: string) {
    return friendsQueries.findById(id);
  }

  async updateFriendById(
    id: string,
    update: Partial<iFriend>,
  ): Promise<iFriend | { error: string }> {
    const friend = await friendsQueries.findById(id);
    if (!friend) return { error: 'Friend not found' };
    const entries = Object.entries(update).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = [
      ...entries.map(([, v]) => v as string | number | boolean | null),
      id,
    ];
    await friendsQueries.update(id, fields, values);
    return { ...friend, ...update };
  }

  async removeFriendById(id: string): Promise<boolean | { error: string }> {
    const friend = await friendsQueries.findById(id);
    if (!friend) return { error: 'Friend not found' };
    if (Math.abs(Number(friend.balance)) > 0)
      await friendsQueries.softDelete(id);
    else await friendsQueries.hardDelete(id);
    return true;
  }

  async searchFriends(
    q: string,
    pageOptions?: PageOptions,
  ): Promise<PageResult<iFriend>> {
    const all = await friendsQueries.search(`%${q.toLowerCase()}%`);
    const offset = pageOptions?.offset ?? 0;
    const limit = pageOptions?.limit ?? 5;
    return {
      data: all.slice(offset, offset + limit),
      matched: all.length,
      total: all.length,
    };
  }
}
