import type { iFriend } from '../models/friend.model.js';
import { FriendRepository } from '../repositories/friends.repositories.js';
import { ConflictError } from '../core/errors/conflict.error.js';

export class FriendsController {
  async checkEmailExists(email: string) {
    return !!(await FriendRepository.getInstance().findFriendByEmail(email));
  }
  async checkPhoneExists(phone: string) {
    return !!(await FriendRepository.getInstance().findFriendByPhone(phone));
  }
  async findFriendByName(name: string) {
    return FriendRepository.getInstance().findFriendByName(name);
  }
  async findFriendById(id: string) {
    return FriendRepository.getInstance().findFriendById(id);
  }

  async addFriend(friend: iFriend) {
    if (friend.email && (await this.checkEmailExists(friend.email))) {
      throw new ConflictError('Email already exists', 'email');
    }
    if (friend.phone && (await this.checkPhoneExists(friend.phone))) {
      throw new ConflictError('Phone already exists', 'phone');
    }
    await FriendRepository.getInstance().addFriend(friend);
    return friend;
  }

  async searchFriends(query: string) {
    const friendRepository = FriendRepository.getInstance();
    return { success: true, ...(await friendRepository.searchFriends(query)) };
  }

  async updateFriend(id: string, updates: Partial<iFriend>) {
    const repo = FriendRepository.getInstance();
    const exiting = await repo.findFriendById(id);

    if (!exiting) {
      return { success: false, error: 'Friend not found' };
    }

    if (updates.email) {
      const emailOwner = await repo.findFriendByEmail(updates.email);
      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictError('Email already exists', 'email');
      }
    }

    if (updates.phone) {
      const phoneOwner = await repo.findFriendByPhone(updates.phone);
      if (phoneOwner && phoneOwner.id !== id) {
        throw new ConflictError('Phone already exists', 'phone');
      }
    }

    const result = await repo.updateFriendById(id, updates);
    if (typeof result === 'object' && result !== null && 'error' in result) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  }

  async removeFriend(id: string) {
    const friendRepository = FriendRepository.getInstance();

    const result = await friendRepository.removeFriendById(id);
    if (typeof result === 'object' && result !== null && 'error' in result) {
      console.log(result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  }

  async allFriends() {
    return FriendRepository.getInstance().getAllFriends();
  }
}
