import type { Row } from "../core/storage/db.js";

export interface iFriend extends Row {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number;//+ they owe, - i owe them
  isDeleted?: boolean;
}
