// @Shared
// Import expense categories to use as budget categories
import { EXPENSE_CATEGORIES } from './expenseTypes';
export const BUDGET_CATEGORIES = EXPENSE_CATEGORIES;

export const BUDGET_STATUS = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    EXPIRED: 'Expired',
    PAUSED: 'Paused'
} as const; // For typescript literal types

export type BudgetCategory = typeof BUDGET_CATEGORIES[keyof typeof BUDGET_CATEGORIES];
export type BudgetStatus = typeof BUDGET_STATUS[keyof typeof BUDGET_STATUS];

export interface BaseBudget {
    targetAmount: number;
    startDate: Date | string;
    endDate: Date | string;
    category: BudgetCategory;
    currentAmount: number;
    description?: string;
    status?: BudgetStatus;
};

export interface BudgetFormData {
    targetAmount: string; // String for form inputs
    startDate: string;
    endDate: string;
    category: BudgetCategory;
    description: string;
    status?: BudgetStatus;
};

export interface IBudget extends BaseBudget {
    _id: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};