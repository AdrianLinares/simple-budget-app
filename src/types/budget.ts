export interface Expense {
  id: string;
  description: string;
  amount: number;
  isActive: boolean;
  isPaid: boolean;
}

export interface BudgetCategory {
  name: string;
  percentage: number;
  expenses: Expense[];
  color: string;
  icon: string;
}

export interface BudgetState {
  monthlyIncome: number;
  categories: {
    needs: BudgetCategory;
    wants: BudgetCategory;
    savings: BudgetCategory;
  };
}