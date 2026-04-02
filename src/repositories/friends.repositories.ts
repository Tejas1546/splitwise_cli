import type { PageOptions, PageResult } from "../core/page-options.js";
import type { iFriend } from "../models/friend.model.js";

export class FriendRepository {
  private static instance: FriendRepository;
  private friends: iFriend[] = [];
  static getInstance() {
    if (!FriendRepository.instance) {
      FriendRepository.instance = new FriendRepository();
    }
    return FriendRepository.instance;
  }

  private constructor() {}
  addFriend(friend: iFriend) {
    this.friends.push(friend);
    console.log("Friend added to repository:", friend);
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
      (friend) => !friend.isDeleted && friend.name.toLowerCase() === name.toLowerCase(),
    );
  }

  updateFriend(name: string, updates: Partial<iFriend>): iFriend | { error: string } {
    const friend = this.friends.find(
      (f) => !f.isDeleted && f.name.toLowerCase() === name.toLowerCase(),
    );
    if (!friend) {
      return { error: "Friend not found" };
    }
    Object.assign(friend, updates);
    return friend;
  }

  removeFriend(name: string): boolean | { error: string } {
    const friendIndex = this.friends.findIndex(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (friendIndex === -1) {
      return { error: "Friend not found" };
    }

    const friend = this.friends[friendIndex]!;

    if (Math.abs(friend.balance) > 0) {
      friend.isDeleted = true;
      console.log(
        `Soft deleted friend ${friend.name} due to pending payments: ${friend.balance}`,
      );
    } else {
      this.friends.splice(friendIndex, 1);
      console.log(`Hard deleted friend ${friend.name} as balance is 0`);
    }
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
