import type { iFriend } from "../models/friend.model.js";
import { FriendRepository } from "../repositories/friends.repositories.js";

export class FriendsController {
  checkEmailExists(email: string) {
    return false;
  }
  checkPhoneExists(phone: string) {
    return false;
  }
  addFriend(friend: iFriend) {
    if (!FriendRepository.getInstance()) {
      return { success: false };
    }
    FriendRepository.getInstance().addFriend(friend);
    return { success: true };
  }

  searchFriends(query: string) {
    const friendRepository = FriendRepository.getInstance();
    if (!friendRepository) {
      return { success: false, data: [], matched: 0, total: 0 };
    }
    return { success: true, ...friendRepository.searchFriends(query) };
  }

  removeFriend(name: string) {
    const friendRepository = FriendRepository.getInstance();
    if (!friendRepository) {
      return { success: false };
    }
    
    const result = friendRepository.removeFriend(name);
    if (typeof result === "object") {
      console.log(result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  }
}
