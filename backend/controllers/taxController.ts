import { FinancialYearCalculatorFactory } from '../classes/FinancialYearCalculator';
import { TaxCalculatorFactory } from '../classes/TaxCalculator';
import Expense from '../models/Expense';
import Income from '../models/Income';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { IExpense } from '../types/expenseTypes';
import { Country } from '../types/globalTypes';
import { IIncome } from '../types/incomeTypes';

class TaxHandler {
    async getTaxRecords(req: AuthenticatedRequest) {
        const incomes = await getIncomeRecordsForUsersFinancialYear(req.user?._id!, req.user?.country);
        const expenses = await getExpenseRecordsForUsersFinancialYear(req.user?._id!, req.user?.country);

        const taxCalculatorFactory = new TaxCalculatorFactory();
        const taxCalculator = taxCalculatorFactory.getTaxCalculator(req.user?.country);

        const grossIncome = incomes.reduce((total, income) => total + income.amount, 0);

        incomes.forEach((income) => {
            if (!income.isTaxPaid) {
                income.tax = taxCalculator.calculateIncomeTax(income.amount, grossIncome);
            }
        });
        return { incomes, expenses };
    }
}

const getTax = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const taxHandler = new TaxHandler();
        const { incomes, expenses } = await taxHandler.getTaxRecords(req);
        res.json({ incomes, expenses });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const getIncomeRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IIncome[]> => {
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(country || Country.Australia);
    const financialYear = financialYearCalculator.getFinancialYear(new Date()); // Extensible for different dates by passing through an argument

    // Get all incomes for this financial year
    const incomes: IIncome[] = await Income.find({
        userId: userId,
        dateEarned: {
            $gte: financialYear.start,
            $lte: financialYear.end
        }
    }).sort({ dateEarned: -1 });

    return incomes;
};

const getExpenseRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IExpense[]> => {
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(country || Country.Australia);
    const financialYear = financialYearCalculator.getFinancialYear(new Date()); // Extensible for different dates by passing through an argument

    // Get all expenses for this financial year
    const expenses: IExpense[] = await Expense.find({
        userId: userId,
        dateSpent: {
            $gte: financialYear.start,
            $lte: financialYear.end
        }
    }).sort({ dateSpent: -1 });

    return expenses;
};

// Export using both CommonJS and ES6 for tests
const taxController = {
    getTax
};

// CommonJS export for Node.js
module.exports = taxController;

// ES6 export for TypeScript/modern environments
export { getTax };
export default taxController;