// This is a duplicated const also in frontend/types until PFA-80 (User story 22 can be completed)
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

export const isValidExpenseCategory = (category: string): category is ExpenseCategory => {
    return Object.values(EXPENSE_CATEGORIES).includes(category as ExpenseCategory);
};

export const isValidRecurringFrequency = (frequency: string): frequency is RecurringFrequency => {
    return Object.values(RECURRING_FREQUENCIES).includes(frequency as RecurringFrequency);
};
