export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

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

export interface PersonalConfiguration {
  id: number;
  start_counting: string;
  end_counting: string;
  available_money: number;
  month_available_money: string;
  month_name: string;
  expense_percentage_limit: number;
}

export interface MonthlyBalance {
  avalaibleMoney: string;
  totalPrice: string;
  restMoney: string;
  countSpent: number;
}

export interface PercentageUsed {
  message: boolean;
  percentageUser: number;
  color: 'red' | 'green';
}

export interface DashboardSummary {
  monthly_balance: MonthlyBalance | null;
  percentageUsed: PercentageUsed | null;
  hasConfiguration: boolean;
}
