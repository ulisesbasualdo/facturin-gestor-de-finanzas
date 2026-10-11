import { MonthStatus } from '../../months/month-status.js';

export interface MonthlySummary {
  gained: number;
  spent: number;
  pendingIncome: number;
  pendingExpenses: number;
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  projectedMonthEnd: number;
  projectedWithPendingIncome: number;
  accumulatedBeforeThisMonth: number;
  totalProjectedSavings: number;
  totalProjectedSavingsWithPendingIncome: number;
  trend: 'increase' | 'decrease';
  monthStatus: MonthStatus;
}
