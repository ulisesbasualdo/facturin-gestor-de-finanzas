export interface MonthlySummary {
  gained: number;
  spent: number;
  pendingExpenses: number;
  remaining: number;
  projectedMonthEnd: number;
  accumulatedBeforeThisMonth: number;
  totalProjectedSavings: number;
  trend: 'increase' | 'decrease';
}
