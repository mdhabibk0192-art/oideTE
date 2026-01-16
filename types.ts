
export type TransactionType = 'INCOME' | 'EXPENSE' | 'BILL' | 'DEBT';

export interface Transaction {
  id: string;
  date: string; // ISO format
  type: TransactionType;
  amount: number;
  note?: string;
  personName?: string; // Specific to Debt
}

export interface AppState {
  isLoggedIn: boolean;
  hasSetDailyIncome: boolean;
  currentDailyIncome: number;
  transactions: Transaction[];
  lastActiveDate?: string; // Tracks the last day the user was active (YYYY-MM-DD)
}

export enum LoginMethod {
  EMAIL = 'Email',
  GMAIL = 'Gmail',
  PHONE = 'Phone Number'
}
