import Expense, { IExpense } from '../models/Expense';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { CreateExpenseRequest, UpdateExpenseRequest } from '../types/expenseTypes'

const getExpenses = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const expenses: IExpense[] = await Expense.find({ userId: req.user?._id }).sort({ dateSpent: -1 });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const getExpenseById = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const expense: IExpense | null = await Expense.findById(req.params.id);
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        if (expense.userId.toString() !== req.user?._id) {
            res.status(403).json({ message: 'Not authorized to view this expense' });
            return;
        }

        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const addExpense = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const { 
        amount, 
        dateSpent, 
        description, 
        category, 
        merchant, 
        isRecurring, 
        recurringFrequency, 
        startDate 
    }: CreateExpenseRequest = req.body;

    try {
        if (!amount || !description || !category || !merchant) {
            res.status(400).json({ 
                message: 'Missing required fields: amount, description, category, merchant' 
            });
            return;
        }

        if (amount <= 0) {
            res.status(400).json({ message: 'Amount must be greater than 0' });
            return;
        }

        if (isRecurring && !recurringFrequency) {
            res.status(400).json({ 
                message: 'Recurring frequency is required for recurring expenses' 
            });
            return;
        }

        if (isRecurring && !startDate) {
            res.status(400).json({ 
                message: 'Start date is required for recurring expenses' 
            });
            return;
        }

        const expenseData = {
            userId: req.user?._id,
            amount,
            dateSpent: dateSpent || new Date(),
            description,
            category,
            merchant,
            isRecurring: isRecurring || false,
            ...(isRecurring && { recurringFrequency }),
            ...(isRecurring && { startDate })
        };

        const expense: IExpense = await Expense.create(expenseData);
        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const updateExpense = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const { 
        amount, 
        dateSpent, 
        description, 
        category, 
        merchant, 
        isRecurring, 
        recurringFrequency, 
        startDate 
    }: UpdateExpenseRequest = req.body;

    try {
        const expense: IExpense | null = await Expense.findById(req.params.id);
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        if (expense.userId.toString() !== req.user?._id?.toString()) {
            res.status(403).json({ message: 'Not authorized to update this expense' });
            return;
        }

        if (amount !== undefined && amount <= 0) {
            res.status(400).json({ message: 'Amount must be greater than 0' });
            return;
        }

        if (amount !== undefined) expense.amount = amount;
        if (dateSpent !== undefined) expense.dateSpent = dateSpent;
        if (description !== undefined) expense.description = description;
        if (category !== undefined) expense.category = category as any;
        if (merchant !== undefined) expense.merchant = merchant;
        if (isRecurring !== undefined) expense.isRecurring = isRecurring;
        
        if (expense.isRecurring) {
            if (recurringFrequency !== undefined) expense.recurringFrequency = recurringFrequency as any;
            if (startDate !== undefined) expense.startDate = startDate;
        } else {
            // Clear recurring fields if not recurring
            expense.recurringFrequency = undefined;
            expense.startDate = undefined;
        }

        const updatedExpense: IExpense = await expense.save();
        res.json(updatedExpense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExpense = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


// Export using both CommonJS and ES6 for tests
const expenseController = { 
    getExpenses,
    getExpenseById,
    addExpense,
    deleteExpense,
    updateExpense
};

// CommonJS export for Node.js
module.exports = expenseController;

// ES6 export for TypeScript/modern environments
export { getExpenses, getExpenseById, addExpense, deleteExpense, updateExpense };
export default expenseController;