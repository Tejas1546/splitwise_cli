import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get the directory correctly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define absolute path to avoid directory context issues
const ASSETS_DIR = path.resolve(__dirname, "../assets");
const DB_FILE = path.join(ASSETS_DIR, "friends.json");

/**
 * Persists the friend list into the local JSON file.
 */
export const storeFriendsInFile = <T>(records: T[]): void => {
  try {
    // Ensure the directory exists before saving
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (error: any) {
    console.error(`Warning: Failed to save changes to ${DB_FILE}. Error: ${error.message}`);
  }
};

/**
 * Loads the friend list from the local JSON file.
 */
export const getFriendsFromFile = <T>(): T[] => {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    
    const fileContent = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error(`Warning: Could not read friends data. Operating with an empty state. Error: ${error.message}`);
    return [];
  }
};
