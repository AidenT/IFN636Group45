// Import types and constants from Expense model
import { ExpenseCategory, RecurringFrequency } from '../models/Expense';

// Expense-related types
export interface ExpenseData {
    _id?: string;
    userId: string;
    amount: number;
    dateSpent: Date;
    description: string;
    category: ExpenseCategory;
    merchant: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
    createdAt: Date;
    save?: () => Promise<ExpenseData>;
    remove?: () => Promise<void>;
}

export interface CreateExpenseRequest {
    amount: number;
    dateSpent?: Date;
    description: string;
    category: ExpenseCategory;
    merchant: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
}

export interface UpdateExpenseRequest {
    amount?: number;
    dateSpent?: Date;
    description?: string;
    category?: ExpenseCategory;
    merchant?: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
}
