import type { ValidatorFn } from './Validator.type.js';

export const emailValidator: ValidatorFn = (input: string) => {
  const trimmed = input.trim();
  if (trimmed === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

export const nameValidator: ValidatorFn = (input: string) => {
  const len = input.trim().length;
  return len >= 2 && len <= 20;
};

export const yesOrNo: ValidatorFn = (input: string) => {
  return /^(y|yes|n|no)$/i.test(input.trim());
};
