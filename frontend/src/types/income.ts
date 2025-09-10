// This is a duplicated const also in frontend/types until PFA-80 (User story 22 can be completed)
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