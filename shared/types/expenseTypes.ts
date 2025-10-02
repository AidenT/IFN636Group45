// @Shared
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
} as const; // For typescript literal types

export const RECURRING_FREQUENCIES = {
    WEEKLY: 'Weekly',
    BI_WEEKLY: 'Bi-weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly'
} as const; // For typescript literal types


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

export interface IExpense extends BaseExpense {
    _id: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

