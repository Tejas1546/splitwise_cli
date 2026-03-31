import type { iFriend } from "../models/friend.model.js";
import { FriendRepository } from "../repositories/friends.repository.js";

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
    console.log("Adding friend to database...", friend);
    FriendRepository.getInstance().addFriend(friend);
  }
}
