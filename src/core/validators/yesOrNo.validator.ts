import type { ValidatorFn } from "./Validator.type.js";
export const yesOrNo: ValidatorFn = (input: string) => {
  return /^(y|yes|n|no)$/i.test(input.trim());
};
