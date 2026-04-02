import type { iFriend } from "../models/friend.model.js";
import { FriendRepository } from "../repositories/friends.repositories.js";

export class FriendsController {
  checkEmailExists(email: string) {
    return !!FriendRepository.getInstance().findFriendByEmail(email);
  }
  checkPhoneExists(phone: string) {
    return !!FriendRepository.getInstance().findFriendByPhone(phone);
  }
  addFriend(friend: iFriend) {
    if (friend.email && this.checkEmailExists(friend.email)) {
      return { success: false, error: "A friend with this email already exists." };
    }
    if (friend.phone && this.checkPhoneExists(friend.phone)) {
      return { success: false, error: "A friend with this phone number already exists." };
    }
    FriendRepository.getInstance().addFriend(friend);
    return { success: true };
  }

  searchFriends(query: string) {
    const friendRepository = FriendRepository.getInstance();
    return { success: true, ...friendRepository.searchFriends(query) };
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
}
