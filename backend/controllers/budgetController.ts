import { BudgetBuilder } from '../classes/BudgetCalculator';
import Budget from '../models/Budget';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { CreateBudgetRequest, IBudgetDocument, UpdateBudgetRequest } from '../types/backendBudgetTypes';

const getBudgets = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const budgets: IBudgetDocument[] = await Budget.find({ userId: req.user?._id });

        const budgetsWithProgress = await Promise.all(budgets.map(async budget => {
            const builder = await BudgetBuilder
                .from(budget)
                .withProgress();
            return builder.build();
        }));

        res.json(budgetsWithProgress);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const createBudget = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const {
        targetAmount,
        startDate,
        endDate,
        category,
        description,
        status
    }: CreateBudgetRequest = req.body;

    try {
        if (!targetAmount || !startDate || !endDate || !category) {
            res.status(400).json({ message: 'Target amount, start date, end date, and category are required' });
            return;
        }

        if (targetAmount <= 0) {
            res.status(400).json({ message: 'Target amount must be greater than 0' });
            return;
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (endDateObj <= startDateObj) {
            res.status(400).json({ message: 'End date must be after start date' });
            return;
        }

        const budgetData = {
            userId: req.user?._id,
            targetAmount,
            startDate: startDateObj,
            endDate: endDateObj,
            category,
            description: description || '',
            status: status || 'Active'
        };

        const budget: IBudgetDocument = await Budget.create(budgetData);

        const budgetWithProgress = await BudgetBuilder
            .from(budget)
            .withProgress();

        res.status(201).json(budgetWithProgress.build());
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const updateBudget = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const {
        targetAmount,
        startDate,
        endDate,
        category,
        description,
        status
    }: UpdateBudgetRequest = req.body;

    try {
        const budget: IBudgetDocument | null = await Budget.findById(req.params.id);
        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        if (budget.userId.toString() !== req.user?._id?.toString()) {
            res.status(403).json({ message: 'Not authorized to update this budget' });
            return;
        }

        if (targetAmount !== undefined) {
            if (targetAmount <= 0) {
                res.status(400).json({ message: 'Target amount must be greater than 0' });
                return;
            }
            budget.targetAmount = targetAmount;
        }

        if (startDate !== undefined || endDate !== undefined) {
            const newStartDate = startDate ? new Date(startDate) : budget.startDate;
            const newEndDate = endDate ? new Date(endDate) : budget.endDate;

            if (newEndDate <= newStartDate) {
                res.status(400).json({ message: 'End date must be after start date' });
                return;
            }

            if (startDate !== undefined) budget.startDate = newStartDate;
            if (endDate !== undefined) budget.endDate = newEndDate;
        }

        if (category !== undefined) budget.category = category;
        if (description !== undefined) budget.description = description;
        if (status !== undefined) budget.status = status;

        const updatedBudget: IBudgetDocument = await budget.save();

        const budgetWithProgress = await BudgetBuilder
            .from(updatedBudget)
            .withProgress();

        res.json(budgetWithProgress.build());
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/budgets/:id - Delete a budget
const deleteBudget = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const budget: IBudgetDocument | null = await Budget.findById(req.params.id);
        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        if (budget.userId.toString() !== req.user?._id?.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this budget' });
            return;
        }

        await Budget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Budget deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export {
    createBudget, deleteBudget, getBudgets, updateBudget
};

