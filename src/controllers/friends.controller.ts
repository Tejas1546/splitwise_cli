import type { iFriend } from "../models/friend.model.js";
import { FriendRepository } from "../repositories/friends.repositories.js";
import { ConflictError } from "../core/errors/conflict.error.js";

export class FriendsController {
  checkEmailExists(email: string) {
    return !!FriendRepository.getInstance().findFriendByEmail(email);
  }
  checkPhoneExists(phone: string) {
    return !!FriendRepository.getInstance().findFriendByPhone(phone);
  }
  findFriendByName(name: string) {
    return FriendRepository.getInstance().findFriendByName(name);
  }

  addFriend(friend: iFriend) {
    if (friend.email && this.checkEmailExists(friend.email)) {
      throw new ConflictError("Email already exists", "email");
    }
    if (friend.phone && this.checkPhoneExists(friend.phone)) {
      throw new ConflictError("Phone already exists", "phone");
    }
    FriendRepository.getInstance().addFriend(friend);
    return friend;
  }

  searchFriends(query: string) {
    const friendRepository = FriendRepository.getInstance();
    return { success: true, ...friendRepository.searchFriends(query) };
  }

  updateFriend(name: string, updates: Partial<iFriend>) {
    const repo = FriendRepository.getInstance();

    // Check email conflict — skip if it belongs to the same friend
    if (updates.email) {
      const emailOwner = repo.findFriendByEmail(updates.email);
      if (emailOwner && emailOwner.name.toLowerCase() !== name.toLowerCase()) {
        throw new ConflictError("Email already exists", "email");
      }
    }
    // Check phone conflict — skip if it belongs to the same friend
    if (updates.phone) {
      const phoneOwner = repo.findFriendByPhone(updates.phone);
      if (phoneOwner && phoneOwner.name.toLowerCase() !== name.toLowerCase()) {
        throw new ConflictError("Phone already exists", "phone");
      }
    }

    const result = repo.updateFriend(name, updates);
    if ("error" in result) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  }

  removeFriend(name: string) {
    const friendRepository = FriendRepository.getInstance();

    const result = friendRepository.removeFriend(name);
    if (typeof result === "object") {
      console.log(result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  }

  allFriends() {
    return FriendRepository.getInstance().getAllFriends;
  }
}
