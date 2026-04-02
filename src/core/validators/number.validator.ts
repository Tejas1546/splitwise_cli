import type { ValidatorFn } from "./Validator.type.js";

export const numberValidator: ValidatorFn = (input: string) => {
  if (!input.trim()) {
    return false;
  }
  return !isNaN(+input);
};
