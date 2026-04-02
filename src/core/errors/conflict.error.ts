export class ConflictError extends Error {
  conflictProperty: string;
  constructor(message: string, conflictProperty: string) {
    super(message);
    this.name = "ConflictError";
    this.conflictProperty = conflictProperty;
  }
}
