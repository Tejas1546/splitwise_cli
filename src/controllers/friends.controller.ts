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
  findFriendById(id: string) {
    return FriendRepository.getInstance().findFriendById(id);
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

  updateFriend(id: string, updates: Partial<iFriend>) {
    const repo = FriendRepository.getInstance();
    const exiting = repo.findFriendById(id);

    if (!exiting) {
      return { success: false, error: "Friend not found" };
    }

    if (updates.email) {
      const emailOwner = repo.findFriendByEmail(updates.email);
      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictError("Email already exists", "email");
      }
    }

    if (updates.phone) {
      const phoneOwner = repo.findFriendByPhone(updates.phone);
      if (phoneOwner && phoneOwner.id !== id) {
        throw new ConflictError("Phone already exists", "phone");
      }
    }

    const result = repo.updateFriendById(id, updates);
    if (typeof result === "object" && result !== null && "error" in result) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  }

  removeFriend(id: string) {
    const friendRepository = FriendRepository.getInstance();

    const result = friendRepository.removeFriendById(id);
    if (typeof result === "object" && result !== null && "error" in result) {
      console.log(result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  }

  allFriends() {
    return FriendRepository.getInstance().getAllFriends;
  }
}
