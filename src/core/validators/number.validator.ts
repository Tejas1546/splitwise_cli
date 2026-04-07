import type { ValidatorFn } from './Validator.type.js';

export const numberValidator: ValidatorFn = (input: string) => {
  if (!input.trim()) {
    return false;
  }
  return !isNaN(+input);
};

export const phoneValidator: ValidatorFn = (input: string) => {
  const trimmed = input.trim();
  if (trimmed === '') return true;
  return trimmed.length === 10 && /^\d{10}$/.test(trimmed);
};
