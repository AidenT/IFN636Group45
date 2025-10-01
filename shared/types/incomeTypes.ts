// @Shared
export const INCOME_CATEGORIES = {
    SALARY: 'Salary',
    FREELANCE: 'Freelance',
    INVESTMENT: 'Investment',
    BUSINESS: 'Business',
    GIFT: 'Gift',
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

// Income form data (for frontend forms)
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

// Frontend interface for Income (clean interface for client-side)
export interface IIncome extends BaseIncome {
    _id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

