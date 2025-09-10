// Import types and constants from Income model
import { IncomeCategory, RecurringFrequency } from '../models/Income';

// Income-related types
export interface IncomeData {
    _id?: string;
    userId: string;
    amount: number;
    dateEarned: Date;
    description: string;
    category: IncomeCategory;
    source: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
    createdAt: Date;
    save?: () => Promise<IncomeData>;
    remove?: () => Promise<void>;
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
