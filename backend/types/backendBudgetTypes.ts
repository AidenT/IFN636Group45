import mongoose, { Document } from 'mongoose';
import { BaseBudget, BudgetCategory, BudgetStatus } from '../types/budgetTypes';

export interface BudgetProgress {
    progressPercentage: number;
    spentAmount: number;
    remainingAmount: number;
    daysRemaining: number;
    isOverBudget: boolean;
    suggestedDailyLimit: number;
}

// Backend Mongoose Document interface for Budget
export interface IBudgetDocument extends Document, BaseBudget {
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    progress?: BudgetProgress
    calculateCurrentAmount(): Promise<number>;
    calculateProgress(): Promise<BudgetProgress>;
}

export interface CreateBudgetRequest {
    targetAmount: number;
    startDate: Date;
    endDate: Date;
    category: BudgetCategory;
    description?: string;
    status?: BudgetStatus;
}

export interface UpdateBudgetRequest {
    targetAmount?: number;
    startDate?: Date;
    endDate?: Date;
    category?: BudgetCategory;
    description?: string;
    status?: BudgetStatus;
}