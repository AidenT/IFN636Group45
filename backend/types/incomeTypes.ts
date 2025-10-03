/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/incomeTypes.ts
 * Generated on: 2025-10-03T00:35:30.098Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/incomeTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

// @Shared
export const INCOME_CATEGORIES = {
    SALARY: 'Salary',
    FREELANCE: 'Freelance',
    INVESTMENT: 'Investment',
    BUSINESS: 'Business',
    GIFT: 'Gift',
    OTHER: 'Other'
} as const; // For typescript literal types

export const RECURRING_FREQUENCIES = {
    WEEKLY: 'Weekly',
    BI_WEEKLY: 'Bi-weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly'
} as const; // For typescript literal types

export type IncomeCategory = typeof INCOME_CATEGORIES[keyof typeof INCOME_CATEGORIES];
export type RecurringFrequency = typeof RECURRING_FREQUENCIES[keyof typeof RECURRING_FREQUENCIES];

export interface BaseIncome {
    amount: number;
    dateEarned: Date;
    description?: string;
    category: IncomeCategory;
    source?: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
    isTaxPaid?: boolean;
    tax?: number;
}

export interface IncomeFormData {
    amount: string; // String for form inputs
    dateEarned: string;
    description: string;
    category: IncomeCategory;
    source: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: string;
}

export interface IIncome extends BaseIncome {
    _id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}