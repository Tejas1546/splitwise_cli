import type { ValidatorFn } from "./Validator.type.js";

export const phoneValidator: ValidatorFn = (input: string) => {
  const trimmed = input.trim();
  if (trimmed === "") return true;
  return trimmed.length === 10 && /^\d{10}$/.test(trimmed);
};
