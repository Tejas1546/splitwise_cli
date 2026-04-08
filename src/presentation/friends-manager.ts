import {
  numberValidator,
  phoneValidator,
} from '../core/validators/number.validator.js';
import {
  nameValidator,
  emailValidator,
  yesOrNo,
} from '../core/validators/string.validator.js';
import { openInteractionManager, type Choice } from './interaction-manager.js';
import { FriendsController } from '../controllers/friends.controller.js';
import { displayTable } from '../core/display-table.js';

const controller = new FriendsController();

const options: Choice[] = [
  { label: 'Add Friend', value: '1' },
  { label: 'Search Friend', value: '2' },
  { label: 'Update Friend', value: '3' },
  { label: 'Remove Friend', value: '4' },
  { label: 'Exit', value: '5' },
];

const { ask, choose, close } = openInteractionManager();

const optionalValidator =
  (validatorFn: (input: string) => boolean) => (input: string) =>
    !input.trim() || validatorFn(input);

const addFriend = async () => {
  let name = await ask("Enter friend's name: ", { validator: nameValidator });
  let email = await ask("Enter friend's email (optional): ", {
    validator: optionalValidator(emailValidator),
  });
  let phone = await ask("Enter friend's phone number (optional): ", {
    validator: optionalValidator(phoneValidator),
  });
  const openingBalance = await ask(
    'Enter opening balance (+ve means they owe you, -ve means you owe them): ',
    { validator: numberValidator, defaultAnswer: '0' },
  );

  if (!name) {
    console.log('Error: Name is mandatory');
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
      console.log('Friend added successfully!');
      const updatedFriend = controller.findFriendById(friendData.id);
      if (updatedFriend) {
        displayTable([updatedFriend]);
      }
      return;
    } catch (err: unknown) {
      const error = err as Error & { conflictProperty?: string };
      if (error.name === 'ConflictError') {
        console.log(`Conflict: ${error.message}`);
        if (error.conflictProperty === 'email') {
          email = await ask('Enter a different email: ', {
            validator: optionalValidator(emailValidator),
          });
        } else if (error.conflictProperty === 'phone') {
          phone = await ask('Enter a different phone number: ', {
            validator: optionalValidator(phoneValidator),
          });
        } else if (error.conflictProperty === 'name') {
          name = await ask('Enter a different name: ', {
            validator: nameValidator,
          });
        }
      } else {
        console.log(
          `Failed to add friend: ${error.message || 'Unknown error'}`,
        );
        return;
      }
    }
  }
};

const searchFriend = async () => {
  const query =
    (await ask(
      'Enter search keyword (name, email, or phone) [Leave empty for all friends]: ',
    )) || '';

  if (!query.trim()) {
    const list = controller.allFriends();
    if (!list || list.length === 0) {
      console.log('You have no friends recorded.');
    } else {
      console.log(`\nDisplaying all ${list.length} friend(s):`);
      displayTable(list);
    }
    return;
  }

  const result = controller.searchFriends(query);

  if (result.success && result.data && result.data.length > 0) {
    console.log(`\nFound ${result.matched} friend(s):`);
    displayTable(result.data);
  } else {
    console.log('No friends matched your search criteria.');
  }
};

const updateFriend = async () => {
  const targetQuery =
    (await ask(
      'Enter the name, email, or phone of the friend you wish to update (Leave empty to list all): ',
    )) || '';

  let matchingFriends;

  // Handle empty input by fetching all friends
  if (!targetQuery.trim()) {
    matchingFriends = controller.allFriends();
  } else {
    const searchResult = controller.searchFriends(targetQuery as string);
    matchingFriends = searchResult.data;
  }

  if (!matchingFriends || matchingFriends.length === 0) {
    console.log('Sorry, no friends matched that criteria.');
    return;
  }

  let selectedFriend;

  if (matchingFriends.length === 1) {
    selectedFriend = matchingFriends[0]!;
  } else {
    console.log(
      `\nFound ${matchingFriends.length} friends. Please select one:`,
    );
    displayTable(matchingFriends, 'Choice');

    const indexStr = await ask(
      'Enter the Choice number of the friend to update: ',
      {
        validator: numberValidator,
      },
    );

    const selectedIdx = Number(indexStr) - 1;

    if (selectedIdx < 0 || selectedIdx >= matchingFriends.length) {
      console.log('Invalid selection. Cancelling update.');
      return;
    }
    selectedFriend = matchingFriends[selectedIdx]!;
  }

  console.log(
    `\nUpdating details for ${selectedFriend.name}. Press Enter to keep current values.`,
  );
  const confirmNameChange =
    (await ask(`Do you want to change the name? Yes(y)/No(n): `, {
      validator: optionalValidator(yesOrNo),
      defaultAnswer: 'no',
    })) || '';

  let newName;
  if (confirmNameChange.trim().toLowerCase().startsWith('y')) {
    newName = await ask(`New Name (current: ${selectedFriend.name}): `, {
      validator: nameValidator,
      defaultAnswer: selectedFriend.name,
    });
  }
  const email = await ask(
    `New Email (current: ${selectedFriend.email || 'None'}): `,
    {
      validator: optionalValidator(emailValidator),
      defaultAnswer: selectedFriend.email || '',
    },
  );

  const phone = await ask(
    `New Phone (current: ${selectedFriend.phone || 'None'}): `,
    {
      validator: optionalValidator(phoneValidator),
      defaultAnswer: selectedFriend.phone || '',
    },
  );

  const overrides: { name?: string; email?: string; phone?: string } = {
    ...(newName ? { name: newName as string } : {}),
    ...(email ? { email: email as string } : {}),
    ...(phone ? { phone: phone as string } : {}),
  };

  try {
    const response = controller.updateFriend(selectedFriend.id, overrides);
    if (response.success) {
      console.log('\nFriend updated successfully!');
      const updatedFriend = controller.findFriendById(selectedFriend.id);
      if (updatedFriend) {
        displayTable([updatedFriend]);
      }
    } else {
      console.log(`Cannot update friend: ${response.error}`);
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.log(`Failed to update friend due to conflict: ${error.message}`);
  }
};

const removeFriend = async () => {
  const targetQuery =
    (await ask(
      'Enter the name, email, or phone of the friend to remove (Leave empty to list all): ',
    )) || '';

  let matchingFriends;

  // Handle empty input by fetching all friends
  if (!targetQuery.trim()) {
    matchingFriends = controller.allFriends();
  } else {
    const searchResult = controller.searchFriends(targetQuery as string);
    matchingFriends = searchResult.data;
  }

  if (!matchingFriends || matchingFriends.length === 0) {
    console.log('Sorry, no friends matched that criteria.');
    return;
  }

  let selectedFriend;

  if (matchingFriends.length === 1) {
    selectedFriend = matchingFriends[0]!;
  } else {
    console.log(
      `\nFound ${matchingFriends.length} friends. Please select one:`,
    );
    displayTable(matchingFriends, 'Choice');

    const indexStr = await ask(
      'Enter the Choice number of the friend to remove: ',
      {
        validator: numberValidator,
      },
    );

    const selectedIdx = Number(indexStr) - 1;

    if (selectedIdx < 0 || selectedIdx >= matchingFriends.length) {
      console.log('Invalid selection. Cancelling removal.');
      return;
    }
    selectedFriend = matchingFriends[selectedIdx]!;
  }
  const removeFriend = controller.findFriendById(selectedFriend.id);
  if (removeFriend) {
    displayTable([removeFriend]);
  }
  const confirmStr =
    (await ask(
      `Do you want to delete ${selectedFriend.name}'s account Yes(y)/No(n) ? `,
      {
        validator: optionalValidator(yesOrNo),
        defaultAnswer: 'no',
      },
    )) || '';

  if (!confirmStr.trim().toLowerCase().startsWith('y')) {
    console.log('Operation cancelled.');
    return;
  }

  const result = controller.removeFriend(selectedFriend.id);
  if (result.success) {
    console.log(`${selectedFriend.name}'s account removed successfully.`);
  } else {
    console.log(`Failed to remove friend: ${result.error}`);
  }
};

export const manageFriends = async () => {
  console.log(
    "\nTip: You can type 'esc' at any prompt to cancel and return to the main menu.\n",
  );

  while (true) {
    try {
      const userChoice = await choose(
        'What would you like to do? ',
        options,
        false,
      );
      if (!userChoice) continue;

      switch (userChoice.value) {
        case '1':
          await addFriend();
          break;
        case '2':
          await searchFriend();
          break;
        case '3':
          await updateFriend();
          break;
        case '4':
          await removeFriend();
          break;
        case '5':
          console.log('Exiting Connection Manager...');
          close();
          return;
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'CANCELLED_BY_USER') {
        console.log('\n Operation cancelled. Returning to main menu...\n');
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error('\n An unexpected error occurred:', errorMessage);
      }
    }
  }
};
