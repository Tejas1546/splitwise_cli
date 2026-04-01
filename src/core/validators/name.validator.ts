import type { ValidatorFn } from "./Validator.type.js";

export const nameValidator: ValidatorFn = (input: string) => {
  const len = input.trim().length;
  return len >= 2 && len <= 20;
};
