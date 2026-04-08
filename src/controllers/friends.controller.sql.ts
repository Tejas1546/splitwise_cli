import type { iFriend } from '../models/friend.model.js';
import { FriendRepository } from '../repositories/firends.repositories.sql.js';
import { ConflictError } from '../core/errors/conflict.error.js';

export class FriendsController {
  private repo = FriendRepository.getInstance();

  async checkEmailExists(email: string) {
    return !!(await this.repo.findFriendByEmail(email));
  }

  async checkPhoneExists(phone: string) {
    return !!(await this.repo.findFriendByPhone(phone));
  }

  findFriendByName(name: string) {
    return this.repo.findFriendByName(name);
  }

  findFriendById(id: string) {
    return this.repo.findFriendById(id);
  }

  async addFriend(friend: iFriend) {
    if (friend.email && (await this.checkEmailExists(friend.email)))
      throw new ConflictError('Email already exists', 'email');
    if (friend.phone && (await this.checkPhoneExists(friend.phone)))
      throw new ConflictError('Phone already exists', 'phone');
    await this.repo.addFriend(friend);
    return friend;
  }

  async searchFriends(query: string) {
    return { success: true, ...(await this.repo.searchFriends(query)) };
  }

  async updateFriend(id: string, updates: Partial<iFriend>) {
    const existing = await this.repo.findFriendById(id);
    if (!existing) return { success: false, error: 'Friend not found' };

    if (updates.email) {
      const emailOwner = await this.repo.findFriendByEmail(updates.email);
      if (emailOwner && emailOwner.id !== id)
        throw new ConflictError('Email already exists', 'email');
    }

    if (updates.phone) {
      const phoneOwner = await this.repo.findFriendByPhone(updates.phone);
      if (phoneOwner && phoneOwner.id !== id)
        throw new ConflictError('Phone already exists', 'phone');
    }

    const result = await this.repo.updateFriendById(id, updates);
    if ('error' in result) return { success: false, error: result.error };
    return { success: true, data: result };
  }

  async removeFriend(id: string) {
    const result = await this.repo.removeFriendById(id);
    if (typeof result === 'object' && 'error' in result)
      return { success: false, error: result.error };
    return { success: true };
  }

  allFriends() {
    return this.repo.getAllFriends();
  }
}
