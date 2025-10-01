import mongoose, { Document } from 'mongoose';
import { BaseIncome, IncomeCategory, RecurringFrequency } from '../types/incomeTypes';

// Backend Mongoose Document interface for Income
export interface IIncomeDocument extends Document, BaseIncome {
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateIncomeRequest {
    amount?: number;
    dateEarned?: Date;
    description?: string;
    category?: IncomeCategory;
    source?: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
}

export interface CreateIncomeRequest {
    amount: number;
    dateEarned?: Date;
    description: string;
    category: IncomeCategory;
    source: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
}