import type { PageOptions, PageResult } from '../core/page-options.js';
import type { iFriend } from '../models/friend.model.js';
import { SQLManager } from '../models/sql-manager.js';

export class FriendRepository {
  private static instance: FriendRepository;
  private sqlManager: SQLManager;

  static getInstance() {
    if (!FriendRepository.instance) {
      FriendRepository.instance = new FriendRepository();
    }
    return FriendRepository.instance;
  }

  private constructor() {
    this.sqlManager = SQLManager.getInstance();
  }

  async getAllFriends(): Promise<iFriend[]> {
    return this.sqlManager.getAllFriends();
  }

  async addFriend(friend: iFriend): Promise<void> {
    await this.sqlManager.insertFriend(friend);
  }

  async findFriendByEmail(email: string): Promise<iFriend | undefined> {
    return this.sqlManager.getFriendByEmail(email);
  }

  async findFriendByPhone(phone: string): Promise<iFriend | undefined> {
    return this.sqlManager.getFriendByPhone(phone);
  }

  async findFriendByName(name: string): Promise<iFriend | undefined> {
    return this.sqlManager.getFriendByName(name);
  }

  async findFriendById(id: string): Promise<iFriend | undefined> {
    return this.sqlManager.getFriendById(id);
  }

  async updateFriendById(
    id: string,
    update: Partial<iFriend>,
  ): Promise<iFriend | { error: string }> {
    const friend = await this.sqlManager.getFriendById(id);
    if (!friend) return { error: 'Friend not found' };

    // Apply updates
    Object.assign(friend, update);
    await this.sqlManager.updateFriend(friend);

    return friend;
  }

  async removeFriendById(id: string): Promise<boolean | { error: string }> {
    const friend = await this.sqlManager.getFriendById(id);
    if (!friend) return { error: 'Friend not found' };

    if (Math.abs(friend.balance) > 0) {
      await this.sqlManager.softDeleteFriend(id);
    } else {
      await this.sqlManager.hardDeleteFriend(id);
    }
    return true;
  }

  async searchFriends(
    query: string,
    pageOptions?: PageOptions,
  ): Promise<PageResult<iFriend>> {
    const limit = pageOptions?.limit || 5;
    const offset = pageOptions?.offset || 0;

    return this.sqlManager.searchFriends(query, limit, offset);
  }
}
