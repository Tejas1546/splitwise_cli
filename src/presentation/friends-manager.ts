import { numberValidator } from "../core/validators/number.validator.js";
import { nameValidator } from "../core/validators/name.validator.js";
import { phoneValidator } from "../core/validators/phone.validator.js";
import { emailValidator } from "../core/validators/email.validator.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";
import { FriendsController } from "../controllers/firends.controller.js";


const controller = new FriendsController();

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "Update Friend", value: "3" },
  { label: "Remove Friend", value: "4" },
  { label: "Exit", value: "5" },
];

const { ask, choose, close } = openInteractionManager();

const addFriend = async () => {
  const name = await ask("Enter freind name:", { validator: nameValidator });
  const email = await ask("Enter friend email", { validator: emailValidator });
  const phone = await ask("Enter friend phone number", { validator: phoneValidator });
  const openingBalance = await ask(
    "Enter opening balance (positive mean they owe you,negative means you owe them)",
    { validator: numberValidator },
  );

  if (!name) {
    console.log("Name is required.");
    return;
  }

  const friend = {
    id: Date.now().toString(),
    name: name,
    balance: Number(openingBalance) || 0,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };

  const result = controller.addFriend(friend);
  if (result.success) {
    console.log("Friend added successfully!");
  } else {
    console.log("Failed to add friend.");
  }
};

const searchFriend = async () => {
  const query = await ask("Enter search query (name, email, or phone):");
  if (!query) {
    console.log("Query cannot be empty.");
    return;
  }
  
  const result = controller.searchFriends(query);
  if (result.success && result.data && result.data.length > 0) {
    console.log(`\nFound ${result.matched} friend(s):`);
    result.data.forEach((f) => {
      console.log(`- ${f.name} (ID: ${f.id}, Email: ${f.email || 'N/A'}, Phone: ${f.phone || 'N/A'}, Balance: ${f.balance})`);
    });
    console.log();
  } else {
    console.log("No friends found.");
  }
};

const removeFriend = async () => {
  const name = await ask("Enter the name of the friend to remove:");
  if (!name) {
    console.log("Name cannot be empty.");
    return;
  }
  
  const result = controller.removeFriend(name);
  if (result.success) {
    console.log("Friend removed successfully!");
  } else {
    console.log(`Failed to remove friend: ${result.error}`);
  }
};

export const manageFriends = async () => {
  while (true) {
    const choice = await choose("What do you want to do?", options, false);
    
    if (!choice) continue;

    switch (choice.value) {
      case "1":
        await addFriend();
        break;
      case "2":
        await searchFriend();
        break;
      case "3":
        console.log("Updating friend...");
        break;
      case "4":
        await removeFriend();
        break;
      case "5":
        console.log("Exiting...");
        close();
        return;
    }
  }
};
