export interface Expense {
  id: string;
  name: string;
  date: string;
  amount: number;
}

export interface MonthlyBudget {
  id: string;
  month: string; // e.g., "2024-03"
  availableFunds: number;
}

export type View = 'login' | 'register' | 'dashboard' | 'settings';
