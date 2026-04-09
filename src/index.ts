import { manageFriends } from './presentation/friends-manager.js';
import { SQLManager } from './models/sql-manager.js';

const run = async () => {
  try {
    await SQLManager.getInstance().initializeDatabase();
  } catch (err) {
    console.error(
      'Failed to connect to MySQL DB or create tables. Check your connection!',
    );
    console.error(err);
    process.exit(1);
  }
  await manageFriends();
};

run();
