import { numberValidator } from "../core/validators/number.validator.js";
import { nameValidator } from "../core/validators/name.validator.js";
import { phoneValidator } from "../core/validators/phone.validator.js";
import { emailValidator } from "../core/validators/email.validator.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";
import { FriendsController } from "../controllers/friends.controller.js";
import { displayTable } from "../core/display-table.js";

const controller = new FriendsController();

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "Update Friend", value: "3" },
  { label: "Remove Friend", value: "4" },
  { label: "All Friends", value: "5" },
  { label: "Exit", value: "6" },
];

const { ask, choose, close } = openInteractionManager();

const optionalValidator = (validatorFn: any) => (input: string) => !input.trim() || validatorFn(input);

const addFriend = async () => {
  let name = await ask("Enter friend's name: ", { validator: nameValidator });
  let email = await ask("Enter friend's email (optional): ", { validator: optionalValidator(emailValidator) });
  let phone = await ask("Enter friend's phone number (optional): ", { validator: optionalValidator(phoneValidator) });
  const openingBalance = await ask(
    "Enter opening balance (+ve means they owe you, -ve means you owe them): ",
    { validator: numberValidator, defaultAnswer: "0" }
  );

  if (!name) {
    console.log("Error: Name is mandatory");
    return;
  }

  while (true) {
    const friendData = {
      id: Date.now().toString(),
      name: name as string,
      balance: Number(openingBalance) || 0,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    };

    try {
      controller.addFriend(friendData);
      console.log("Friend added successfully!");
      return;
    } catch (error: any) {
      if (error.name === "ConflictError") {
        console.log(`Conflict: ${error.message}`);
        if (error.conflictProperty === "email") {
          email = await ask("Enter a different email: ", { validator: optionalValidator(emailValidator) });
        } else if (error.conflictProperty === "phone") {
          phone = await ask("Enter a different phone number: ", { validator: optionalValidator(phoneValidator) });
        } else if (error.conflictProperty === "name") {
          name = await ask("Enter a different name: ", { validator: nameValidator });
        }
      } else {
        console.log(`Failed to add friend: ${error.message || "Unknown error"}`);
        return;
      }
    }
  }
};

const searchFriend = async () => {
  const query = await ask("Enter search keyword (name, email, or phone): ") || "";
  const result = controller.searchFriends(query);

  if (result.success && result.data && result.data.length > 0) {
    console.log(`\nFound ${result.matched} friend(s):`);
    displayTable(result.data);
  } else {
    console.log("No friends matched your search criteria.");
  }
};

const updateFriend = async () => {
  const targetName = await ask("Enter the name of the friend you wish to update: ", { validator: nameValidator });
  if (!targetName) return;

  const existingFriend = controller.findFriendByName(targetName);
  if (!existingFriend) {
    console.log("Sorry, that friend could not be found.");
    return;
  }

  const updateChoices: Choice[] = [
    { label: "Update Name", value: "1" },
    { label: "Update Email", value: "2" },
    { label: "Update Phone", value: "3" },
    { label: "Cancel", value: "4" },
  ];

  const updateAction = await choose(`What would you like to update for ${existingFriend.name}? `, updateChoices, false);

  if (!updateAction || updateAction.value === "4") return;

  const overrides: any = {};
  switch (updateAction.value) {
    case "1":
      overrides.name = await ask(`New Name (current: ${existingFriend.name}): `, { validator: nameValidator, defaultAnswer: existingFriend.name });
      break;
    case "2":
      overrides.email = await ask(`New Email (current: ${existingFriend.email || 'None'}): `, { validator: emailValidator, defaultAnswer: existingFriend.email || "" });
      break;
    case "3":
      overrides.phone = await ask(`New Phone (current: ${existingFriend.phone || 'None'}): `, { validator: phoneValidator, defaultAnswer: existingFriend.phone || "" });
      break;
  }

  try {
    const response = controller.updateFriend(existingFriend.name, overrides);
    if (response.success) {
      console.log("Friend updated successfully!");
    } else {
      console.log(`Cannot update friend: ${response.error}`);
    }
  } catch (error: any) {
    console.log(`Failed to update friend due to conflict: ${error.message}`);
  }
};

const removeFriend = async () => {
  const friendName = await ask("Enter the name of the friend to remove: ", { validator: nameValidator });
  if (!friendName) return;

  const result = controller.removeFriend(friendName);
  if (result.success) {
    console.log("Friend removed successfully.");
  } else {
    console.log(`Failed to remove friend: ${result.error}`);
  }
};

const allFriends = () => {
  const list = controller.allFriends();
  
  if (!list || list.length === 0) {
    console.log("You have no friends recorded.");
    return;
  }
  
  displayTable(list);
};

export const manageFriends = async () => {
  while (true) {
    const userChoice = await choose("What would you like to do? ", options, false);
    if (!userChoice) continue;

    switch (userChoice.value) {
      case "1":
        await addFriend();
        break;
      case "2":
        await searchFriend();
        break;
      case "3":
        await updateFriend();
        break;
      case "4":
        await removeFriend();
        break;
      case "5":
        allFriends();
        break;
      case "6":
        console.log("Exiting Connection Manager...");
        close();
        return;
    }
  }
};
