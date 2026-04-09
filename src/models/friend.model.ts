export type iFriend = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number; //+ they owe, - i owe them
  isDeleted?: boolean;
};
