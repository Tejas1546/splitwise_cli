import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Database, JsonAdapter } from "../core/storage/db.js";
import type { iFriend } from "../models/friend.model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface AppData {
  friends: iFriend[];
}

export class AppDBManager {
  private constructor() {
    this.db = new Database<AppData>(
      join(__dirname, "../assets/friends.json"),
      new JsonAdapter<AppData>(),
    );
  }
  private static sharedInstance: AppDBManager | undefined = undefined;
  private db: Database<AppData>;

  static getInstance(): AppDBManager {
    if (!this.sharedInstance) {
      this.sharedInstance = new AppDBManager();
    }
    return this.sharedInstance;
  }

  getDB() {
    return this.db;
  }

  async save() {
    await this.db.save();
  }
}
