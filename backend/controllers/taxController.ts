import { FinancialYearCalculatorFactory } from '../classes/FinancialYearCalculator';
import { TaxCalculatorFactory } from '../classes/TaxCalculator';
import Expense from '../models/Expense';
import Income from '../models/Income';
import { AuthenticatedRequest, ExpressResponse } from '../types/authTypes';
import { Country } from '../types/globalTypes';
import { IExpenseDocument } from '../types/backendExpenseTypes';
import { IIncomeDocument } from '../types/backendIncomeTypes';

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

// TODO: A better implementation for this would be to implement dependency injection and have the DI container manage the financial year calculator instances. This would enable caching too.
const getIncomeRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IIncomeDocument[]> => {
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(new Date(), country); // Extensible for different financial years other than current by changing date argument
    const financialYear = financialYearCalculator.getFinancialYear();

    // Get all incomes for this financial year
    const incomes: IIncomeDocument[] = await Income.find({
        userId: userId,
        dateEarned: {
            $gte: financialYear.start,
            $lte: financialYear.end
        }
    }).sort({ dateEarned: -1 });

    return incomes;
};

const getExpenseRecordsForUsersFinancialYear = async (userId: string, country?: Country): Promise<IExpenseDocument[]> => {
    const financialYearCalculator = FinancialYearCalculatorFactory.getCalculator(new Date(), country); // Extensible for different financial years other than current by changing date argument
    const financialYear = financialYearCalculator.getFinancialYear();

    // Get all expenses for this financial year
    const expenses: IExpenseDocument[] = await Expense.find({
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