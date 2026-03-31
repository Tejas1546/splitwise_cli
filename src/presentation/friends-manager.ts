import { numberValidator } from "../core/validators/number.validator.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "Update Friend", value: "3" },
  { label: "Remove Friend", value: "4" },
  { label: "Exit", value: "5" },
];

const { ask, choose, close } = openInteractionManager();

const addFriend = async () => {
  const name = await ask("Enter freind name:");
  const email = await ask("Enter friend email");
  const phone = await ask("Enter friend phone number");
  const openingBalance = await ask(
    "Enter opening balance (positive mean they owe you,negative means you owe them)",
    { validator: numberValidator },
  );

  const friend = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    balance: Number(openingBalance),
  };
};

export const manageFriends = async () => {
  while (true) {
    const choice = await choose("What do you want to do?", options, false);

    switch (choice!.value) {
      case "1":
        console.log("Adding friend...");
        break;
      case "2":
        console.log("Searchiing friend...");
        break;
      case "3":
        console.log("Updating friend...");
        break;
      case "5":
        console.log("Exiting...");
        close();
        return;
    }
  }
};
