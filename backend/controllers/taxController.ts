import { FinancialYearCalculatorFactory } from '../classes/FinancialYearCalculator';
import { TaxCalculatorFactory } from '../classes/TaxCalculator';
import Expense from '../models/Expense';
import Income from '../models/Income';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { IExpense } from '../types/expenseTypes';
import { Country } from '../types/globalTypes';
import { IIncome } from '../types/incomeTypes';


const getTax = async (req: AuthenticatedRequest, res: ExpressResponse): Promise<void> => {
    try {
        const incomes = await getIncomeRecordsForUsersFinancialYear(req.user?._id!, req.user?.country);
        const expenses = await getExpenseRecordsForUsersFinancialYear(req.user?._id!, req.user?.country);

        const taxCalculatorFactory = new TaxCalculatorFactory();
        const taxCalculator = taxCalculatorFactory.getTaxCalculator(req.user?.country);

        const grossIncome = incomes.reduce((total, income) => total + income.amount, 0);

        incomes.forEach((income, index) => {
            if (!incomes[index].isTaxPaid) {
                incomes[index].tax = taxCalculator.calculateIncomeTax(income.amount, grossIncome);
            }
        });
        res.json({ incomes, expenses });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get income records for the user's current financial year
 * @param userId - The user's ID
 * @param country - The user's country (defaults to Australia)
 * @returns Promise<IIncome[]> - Array of income records for the financial year
 */
const getIncomeRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IIncome[]> => {
    // Get financial year calculator based on user's country (defaults to Australia)
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(country || Country.Australia);
    const financialYear = financialYearCalculator.getFinancialYear();

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

/**
 * Get expense records for the user's current financial year
 * @param userId - The user's ID
 * @param country - The user's country (defaults to Australia)
 * @returns Promise<IExpense[]> - Array of expense records for the financial year
 */
const getExpenseRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IExpense[]> => {
    // Get financial year calculator based on user's country (defaults to Australia)
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(country || Country.Australia);
    const financialYear = financialYearCalculator.getFinancialYear();

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