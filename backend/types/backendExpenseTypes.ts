import mongoose, { Document } from 'mongoose';
import { BaseExpense, ExpenseCategory, RecurringFrequency } from '../types/expenseTypes';

// Backend Mongoose Document interface for Expense
export interface IExpenseDocument extends Document, BaseExpense {
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Backend specific for controller methods
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