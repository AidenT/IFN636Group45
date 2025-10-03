import mongoose from 'mongoose';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import { IBudgetDocument } from '../types/backendBudgetTypes';
import { BudgetCheckResult, BudgetExceededData } from '../types/budgetNotificationTypes';

export interface BudgetProgress {
    progressPercentage: number;
    spentAmount: number;
    remainingAmount: number;
    daysRemaining: number;
    isOverBudget: boolean;
    suggestedDailyLimit: number;
}

export class BudgetBuilder {
    private budget: IBudgetDocument;
    private budgetCalculator: BudgetCalculator;

    public static from(budget: IBudgetDocument): BudgetBuilder {
        return new BudgetBuilder(budget);
    }

    constructor(budget: IBudgetDocument) {
        this.budget = budget;
        this.budgetCalculator = new BudgetCalculator();
    }

    public async withProgress(): Promise<BudgetBuilder> {
        const progress = await this.budgetCalculator.calculateProgress(this.budget);
        this.budget.progress = progress;
        this.budget.currentAmount = progress.spentAmount;
        return this;
    }

    public build(): IBudgetDocument {
        return this.budget;
    }
}

export class BudgetCalculator {
    public async calculateProgress(budget: IBudgetDocument): Promise<BudgetProgress> {
        const expenses = await Expense.find({
            userId: budget.userId,
            dateSpent: { $gte: budget.startDate, $lte: budget.endDate },
            category: budget.category
        });

        const spentAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
        const progressPercentage = (spentAmount / budget.targetAmount) * 100;
        const remainingAmount = budget.targetAmount - spentAmount;
        const endDate = new Date(budget.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const suggestedDailyLimit = daysRemaining > 0 ? remainingAmount / daysRemaining : remainingAmount;

        return {
            progressPercentage,
            spentAmount,
            remainingAmount,
            daysRemaining: Math.max(daysRemaining, 0),
            isOverBudget: spentAmount > budget.targetAmount,
            suggestedDailyLimit: Math.max(suggestedDailyLimit, 0)
        };
    }

    public async checkBudgetExceedance(userId: string, expenseAmount: number, expenseCategory: string, expenseDate: Date): Promise<BudgetCheckResult> {

        const activeBudgetsInCategory = await Budget.find({
            userId,
            category: expenseCategory,
            status: 'Active',
            startDate: { $lte: expenseDate },
            endDate: { $gte: expenseDate }
        });

        const exceededBudgets: BudgetExceededData[] = [];

        for (const budget of activeBudgetsInCategory) {
            const currentExpenses = await Expense.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        category: expenseCategory,
                        dateSpent: {
                            $gte: budget.startDate,
                            $lte: budget.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            const currentAmount = currentExpenses.reduce((total, expense) => total + expense.amount, 0);
            const totalAmountAfterExpense = currentAmount + expenseAmount;

            if (totalAmountAfterExpense > budget.targetAmount) {
                const exceedanceAmount = totalAmountAfterExpense - budget.targetAmount;

                exceededBudgets.push({
                    budgetId: budget._id.toString(),
                    budgetDescription: budget.description,
                    category: budget.category,
                    targetAmount: budget.targetAmount,
                    currentAmount,
                    newExpenseAmount: expenseAmount,
                    totalAmountAfterExpense,
                    exceedanceAmount,
                    startDate: new Date(budget.startDate),
                    endDate: new Date(budget.endDate)
                });
            }
        }

        return {
            willExceed: exceededBudgets.length > 0,
            exceededBudgets
        };
    }
}