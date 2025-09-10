import Income, { IIncome } from '../models/Income';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { 
    CreateIncomeRequest, 
    UpdateIncomeRequest 
} from '../types/incomeTypes';

const getIncomes = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const incomes: IIncome[] = await Income.find({ userId: req.user?._id }).sort({ dateEarned: -1 });
        res.json(incomes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const addIncome = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const { 
        amount, 
        dateEarned, 
        description, 
        category, 
        source, 
        isRecurring, 
        recurringFrequency, 
        startDate 
    }: CreateIncomeRequest = req.body;

    try {
        if (!amount || !description || !category || !source) {
            res.status(400).json({ 
                message: 'Missing required fields: amount, description, category, source' 
            });
            return;
        }

        if (amount <= 0) {
            res.status(400).json({ message: 'Amount must be greater than 0' });
            return;
        }

        if (isRecurring && !recurringFrequency) {
            res.status(400).json({ 
                message: 'Recurring frequency is required for recurring income' 
            });
            return;
        }

        if (isRecurring && !startDate) {
            res.status(400).json({ 
                message: 'Start date is required for recurring income' 
            });
            return;
        }

        const incomeData = {
            userId: req.user?._id,
            amount,
            dateEarned: dateEarned || new Date(),
            description,
            category,
            source,
            isRecurring: isRecurring || false,
            ...(isRecurring && { recurringFrequency }),
            ...(isRecurring && { startDate })
        };

        const income: IIncome = await Income.create(incomeData);
        res.status(201).json(income);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const updateIncome = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    const { 
        amount, 
        dateEarned, 
        description, 
        category, 
        source, 
        isRecurring, 
        recurringFrequency, 
        startDate 
    }: UpdateIncomeRequest = req.body;

    try {
        const income: IIncome | null = await Income.findById(req.params.id);
        if (!income) {
            res.status(404).json({ message: 'Income not found' });
            return;
        }

        if (income.userId.toString() !== req.user?._id?.toString()) {
            res.status(403).json({ message: 'Not authorized to update this income' });
            return;
        }

        if (amount !== undefined && amount <= 0) {
            res.status(400).json({ message: 'Amount must be greater than 0' });
            return;
        }

        if (amount !== undefined) income.amount = amount;
        if (dateEarned !== undefined) income.dateEarned = dateEarned;
        if (description !== undefined) income.description = description;
        if (category !== undefined) income.category = category as any;
        if (source !== undefined) income.source = source;
        if (isRecurring !== undefined) income.isRecurring = isRecurring;
        
        if (income.isRecurring) {
            if (recurringFrequency !== undefined) income.recurringFrequency = recurringFrequency as any;
            if (startDate !== undefined) income.startDate = startDate;
        } else {
            // Clear recurring fields if not recurring
            income.recurringFrequency = undefined;
            income.startDate = undefined;
        }

        const updatedIncome: IIncome = await income.save();
        res.json(updatedIncome);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const deleteIncome = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: 'Income deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const getIncomeById = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const income: IIncome | null = await Income.findById(req.params.id);
        if (!income) {
            res.status(404).json({ message: 'Income not found' });
            return;
        }

        if (income.userId.toString() !== req.user?._id) {
            res.status(403).json({ message: 'Not authorized to view this income' });
            return;
        }

        res.json(income);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Export using both CommonJS and ES6 for tests
const incomeController = { 
    getIncomes, 
    addIncome, 
    updateIncome, 
    deleteIncome, 
    getIncomeById 
};

// CommonJS export for Node.js
module.exports = incomeController;

// ES6 export for TypeScript/modern environments
export { getIncomes, addIncome, updateIncome, deleteIncome, getIncomeById };
export default incomeController;