import Expense from '../models/Expense';
import { IBudgetDocument } from '../types/backendBudgetTypes';

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
}