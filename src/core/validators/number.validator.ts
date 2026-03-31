import type { ValidatorFn } from "./validator.type.ts";

export const numberValidator: ValidatorFn = (input: string) => {
  return !isNaN(+input);
};
