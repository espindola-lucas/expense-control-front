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

export interface Account {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'other';
  initial_balance: number;
  balance: number;
  is_archived: boolean;
  position: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon: string | null;
  position: number;
  is_default: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string | null;
  month: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  level: 'ok' | 'notice' | 'warning' | 'over';
}

export interface RecurringPayment {
  id: number;
  account_id: number;
  account_name: string | null;
  category_id: number | null;
  category_name: string | null;
  name: string;
  type: 'expense' | 'income';
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_generated_date: string | null;
}

export interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface ReportTimeseriesPoint {
  period: string;
  income: number;
  expense: number;
}

export interface ReportCategoryBreakdown {
  category_id: number;
  category_name: string;
  category_icon: string | null;
  total: number;
  percentage: number;
}

export interface UserSettings {
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  date_format: string;
}

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
