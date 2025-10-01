/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/expenseTypes.ts
 * Generated on: 2025-10-01T01:54:22.517Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/expenseTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

// @Shared
// Import types and constants from Expense model
export const EXPENSE_CATEGORIES = {
    HOUSING: 'Housing',
    TRANSPORTATION: 'Transportation',
    FOOD: 'Food',
    HEALTHCARE: 'Healthcare',
    ENTERTAINMENT: 'Entertainment',
    SHOPPING: 'Shopping',
    BILLS: 'Bills',
    EDUCATION: 'Education',
    TRAVEL: 'Travel',
    OTHER: 'Other'
} as const;

export const RECURRING_FREQUENCIES = {
    WEEKLY: 'Weekly',
    BI_WEEKLY: 'Bi-weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly'
} as const;

// Utility types
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[keyof typeof EXPENSE_CATEGORIES];
export type RecurringFrequency = typeof RECURRING_FREQUENCIES[keyof typeof RECURRING_FREQUENCIES];

export interface BaseExpense {
    amount: number;
    dateSpent: Date | string; // Allow both Date and string for API compatibility
    description?: string;
    category: ExpenseCategory;
    merchant?: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date | string; // Allow both Date and string for API compatibility
}

// Expense form data (for frontend forms)
export interface ExpenseFormData {
    amount: string; // String for form inputs
    dateSpent: string;
    description: string;
    category: ExpenseCategory;
    merchant: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: string;
}

// Frontend interface - for React components and API responses
export interface IExpense extends BaseExpense {
    _id: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

