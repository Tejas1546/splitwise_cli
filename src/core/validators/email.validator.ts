import type { ValidatorFn } from "./Validator.type.js";

export const emailValidator: ValidatorFn = (input: string) => {
  const trimmed = input.trim();
  if (trimmed === "") return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};
