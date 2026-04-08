import { initDB } from './models/db-manager.sql.js';
import { manageFriends } from './presentation/friends-manager.sql.js';

const run = async () => {
  await initDB();
  await manageFriends();
};

run();
