import type { PageOptions, PageResult } from '../core/page-options.js';
import type { iFriend } from '../models/friend.model.js';

import { AppDBManager } from '../models/db-manager.js';

export class FriendRepository {
  private static instance: FriendRepository;
  private friends: iFriend[] = [];

  static getInstance() {
    if (!FriendRepository.instance) {
      FriendRepository.instance = new FriendRepository();
    }
    return FriendRepository.instance;
  }

  private constructor() {
    this.friends = AppDBManager.getInstance()
      .getDB()
      .table('friends') as iFriend[];
  }

  get getAllFriends() {
    return this.friends.filter((f) => !f.isDeleted);
  }

  addFriend(friend: iFriend) {
    this.friends.push(friend);
    AppDBManager.getInstance().save();
  }

  findFriendByEmail(email: string) {
    return this.friends.find(
      (friend) => !friend.isDeleted && friend.email === email,
    );
  }

  findFriendByPhone(phone: string) {
    return this.friends.find(
      (friend) => !friend.isDeleted && friend.phone === phone,
    );
  }

  findFriendByName(name: string) {
    return this.friends.find(
      (friend) =>
        !friend.isDeleted && friend.name.toLowerCase() === name.toLowerCase(),
    );
  }

  findFriendById(id: string) {
    return this.friends.find((friend) => !friend.isDeleted && friend.id === id);
  }

  updateFriendById(
    id: string,
    update: Partial<iFriend>,
  ): iFriend | { error: string } {
    const friend = this.findFriendById(id);
    if (!friend) return { error: 'Friend not found' };
    Object.assign(friend, update);
    AppDBManager.getInstance().save();
    return friend;
  }

  removeFriendById(id: string): boolean | { error: string } {
    const friendIndex = this.friends.findIndex((f) => f.id === id);
    if (friendIndex === -1) return { error: 'Friend not found' };
    const friend = this.friends[friendIndex]!;
    if (Math.abs(friend?.balance) > 0) friend.isDeleted = true;
    else this.friends.splice(friendIndex, 1);
    AppDBManager.getInstance().save();
    return true;
  }

  searchFriends(query: string, pageOptions?: PageOptions): PageResult<iFriend> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.friends.filter(
      (friend) =>
        !friend.isDeleted &&
        (friend.name.toLowerCase().includes(lowerQuery) ||
          friend.email?.toLowerCase().includes(lowerQuery) ||
          friend.phone?.toLowerCase().includes(lowerQuery)),
    );
    return {
      data: filtered.slice(
        pageOptions?.offset || 0,
        (pageOptions?.offset || 0) + (pageOptions?.limit || 5),
      ),
      matched: filtered.length,
      total: this.friends.length,
    };
  }
}
