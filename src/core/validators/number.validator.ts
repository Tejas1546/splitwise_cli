import type { ValidatorFn } from "./Validator.type.js";

export const numberValidator: ValidatorFn = (input: string) => {
  return !isNaN(+input);
};
