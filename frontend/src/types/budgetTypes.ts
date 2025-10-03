/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/budgetTypes.ts
 * Generated on: 2025-10-03T00:35:30.093Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/budgetTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

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