import { BudgetCalculator } from '../classes/BudgetCalculator';
import { EmailNotificationHandler, LogNotificationHandler, NotificationMessage, NotificationObserver, NotificationType } from '../classes/NotificiationHandler';
import Expense from '../models/Expense';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { CreateExpenseRequest, ExpenseData, IExpenseDocument, UpdateExpenseRequest } from '../types/backendExpenseTypes';
import { BudgetNotificationMessage } from '../types/budgetNotificationTypes';
import { ExpenseCategory } from '../types/expenseTypes';

// Singleton implementation ensures there will only be one instance of the Notification Observer 
// however, multiple instances of the handlers can be instantiated to send simultaneous notifications via different channels
const notificationObserver = NotificationObserver.getInstance();
const logHandler = new LogNotificationHandler();
const emailHandler = new EmailNotificationHandler(logHandler);
notificationObserver.subscribe(emailHandler);


const getExpenses = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const expenses: IExpenseDocument[] = await Expense.find({ userId: req.user?._id }).sort({ dateSpent: -1 });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const getExpenseById = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const expense: IExpenseDocument | null = await Expense.findById(req.params.id);
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

        const expenseData: ExpenseData = {
            userId: req.user?._id ?? '',
            amount,
            dateSpent: dateSpent || new Date(),
            description,
            category,
            merchant,
            isRecurring: isRecurring || false,
            ...(isRecurring && { recurringFrequency }),
            ...(isRecurring && { startDate }),
            createdAt: new Date()
        };

        // Before creating the expense in the database check if this will exceed any budgets and notify the user via email.
        await notifyBudgetExceedance(req.user?._id, amount, description, category, expenseData.dateSpent);

        const expense: IExpenseDocument = await Expense.create(expenseData);

        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

async function notifyBudgetExceedance(userId: string | undefined, amount: number, description: string, category: ExpenseCategory, dateSpent: string | Date): Promise<void> {
    const budgetCalculator = new BudgetCalculator();

    const budgetCheck = await budgetCalculator.checkBudgetExceedance(
        userId ?? '',
        amount,
        category,
        new Date(dateSpent) || new Date()
    );

    if (budgetCheck.willExceed) {
        const budgetNotificationData: BudgetNotificationMessage = {
            userId: userId ?? '',
            expenseAmount: amount,
            expenseDescription: description,
            expenseCategory: category,
            exceededBudgets: budgetCheck.exceededBudgets
        };

        for (const exceededBudget of budgetCheck.exceededBudgets) {
            const notificationMessage: NotificationMessage = {
                id: `budget-exceeded-${exceededBudget.category}-${Date.now()}`,
                type: NotificationType.BUDGET_EXCEEDED,
                userId: userId ?? '',
                title: `Budget Exceeded: ${exceededBudget.category}`,
                message: `Your expense of $${amount.toFixed(2)} for "${description}" has caused your ${exceededBudget.category} budget to exceed its target of $${exceededBudget.targetAmount.toFixed(2)} by $${exceededBudget.exceedanceAmount.toFixed(2)}.`,
                data: budgetNotificationData,
                timestamp: new Date(),
                priority: exceededBudget.exceedanceAmount > 20 ? 'high' : 'medium',
                read: false
            };

            notificationObserver.notify(notificationMessage);
        }
    }
}

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
        const expense: IExpenseDocument | null = await Expense.findById(req.params.id);
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

        const updatedExpense: IExpenseDocument = await expense.save();
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
export { addExpense, deleteExpense, getExpenseById, getExpenses, updateExpense };
export default expenseController;