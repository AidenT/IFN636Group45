import { BudgetCategory } from './budgetTypes';

export interface BudgetExceededData {
    budgetId: string;
    budgetDescription?: string;
    category: BudgetCategory;
    targetAmount: number;
    currentAmount: number;
    newExpenseAmount: number;
    totalAmountAfterExpense: number;
    exceedanceAmount: number;
    startDate: Date;
    endDate: Date;
}

export interface BudgetCheckResult {
    willExceed: boolean;
    exceededBudgets: BudgetExceededData[];
}

export interface BudgetNotificationMessage {
    userId: string;
    expenseAmount: number;
    expenseDescription: string;
    expenseCategory: BudgetCategory;
    exceededBudgets: BudgetExceededData[];
}