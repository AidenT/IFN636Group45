// Mock the Income and Expense models before requiring anything else
const mockIncomeModel = {
    find: require('sinon').stub()
};

const mockExpenseModel = {
    find: require('sinon').stub()    
};

// Mock TaxCalculator
const mockTaxCalculator = {
    calculateIncomeTax: require('sinon').stub(),
    calculateExpenseTax: require('sinon').stub()
};

// Mock TaxCalculatorFactory constructor
const mockTaxCalculatorFactory = {
    getTaxCalculator: require('sinon').stub().returns(mockTaxCalculator)
};

function MockTaxCalculatorFactory() {
    return mockTaxCalculatorFactory;
}

// Mock FinancialYearCalculator
const mockFinancialYearCalculator = {
    getFinancialYear: require('sinon').stub()
};

// Mock FinancialYearCalculatorFactory static methods
const mockFinancialYearCalculatorFactory = {
    getCalculator: require('sinon').stub().returns(mockFinancialYearCalculator)
};

// Mock all possible module paths
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id === '../models/Income' || id.includes('models/Income')) {
        return { default: mockIncomeModel, ...mockIncomeModel };
    }
    if (id === '../models/Expense' || id.includes('models/Expense')) {
        return { default: mockExpenseModel, ...mockExpenseModel };
    }
    if (id === '../classes/TaxCalculator' || id.includes('TaxCalculator')) {
        return { TaxCalculatorFactory: MockTaxCalculatorFactory };
    }
    if (id === '../classes/FinancialYearCalculator' || id.includes('FinancialYearCalculator')) {
        return { FinancialYearCalculatorFactory: mockFinancialYearCalculatorFactory };
    }
    return originalRequire.apply(this, arguments);
};

const { expect } = require('chai');
const sinon = require('sinon');

// Now require the COMPILED controller after mocking dependencies
const { getTax } = require('../dist/controllers/taxController');

// Restore original require
Module.prototype.require = originalRequire;

describe('Tax Controller Tests - JavaScript/TypeScript Compatible', () => {
    let req;
    let res;
    let statusStub;
    let jsonStub;

        beforeEach(() => {
        // Create fresh request and response mocks for each test
        req = {
            body: {},
            params: {},
            user: { 
                _id: 'mockUserId123',
                country: 'Australia'
            }
        };
        
        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        
        res = {
            status: statusStub,
            json: jsonStub
        };

        // Reset all stubs
        sinon.resetHistory();
        mockIncomeModel.find.reset();
        mockExpenseModel.find.reset();
        mockTaxCalculator.calculateIncomeTax.reset();
        mockTaxCalculator.calculateExpenseTax.reset();
        mockTaxCalculatorFactory.getTaxCalculator.reset();
        mockFinancialYearCalculator.getFinancialYear.reset();
        mockFinancialYearCalculatorFactory.getCalculator.reset();
        
        // Re-setup return values after reset
        mockTaxCalculatorFactory.getTaxCalculator.returns(mockTaxCalculator);
        mockFinancialYearCalculatorFactory.getCalculator.returns(mockFinancialYearCalculator);
    });

    describe('getTax', () => {
        it('should get tax records with calculated income tax for authenticated user successfully', async () => {
            const mockIncomes = [
                {
                    _id: 'income1',
                    userId: 'mockUserId123',
                    amount: 5000,
                    dateEarned: new Date(),
                    description: 'Salary',
                    category: 'Salary',
                    source: 'Company',
                    isTaxPaid: false,
                    tax: 0
                },
                {
                    _id: 'income2',
                    userId: 'mockUserId123',
                    amount: 3000,
                    dateEarned: new Date(),
                    description: 'Freelance',
                    category: 'Freelance',
                    source: 'Client',
                    isTaxPaid: true,
                    tax: 450
                }
            ];

            const mockExpenses = [
                {
                    _id: 'expense1',
                    userId: 'mockUserId123',
                    amount: 500,
                    dateSpent: new Date(),
                    description: 'Office supplies',
                    category: 'Business',
                    merchant: 'Store'
                }
            ];

            const mockFinancialYear = {
                start: new Date('2025-07-01'),
                end: new Date('2026-06-30'),
                label: 'FY2025-2026'
            };

            // Setup mock query chains
            const mockIncomeQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            const mockExpenseQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };

            mockIncomeModel.find.returns(mockIncomeQuery);
            mockExpenseModel.find.returns(mockExpenseQuery);
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);
            mockTaxCalculator.calculateIncomeTax.returns(750); // Mock tax calculation

            await getTax(req, res);



            // Verify financial year calculator was called
            expect(mockFinancialYearCalculatorFactory.getCalculator.calledWith('Australia')).to.be.true;
            expect(mockFinancialYearCalculator.getFinancialYear.calledTwice).to.be.true; // Called once for income, once for expenses

            // Verify database queries
            expect(mockIncomeModel.find.calledOnce).to.be.true;
            expect(mockExpenseModel.find.calledOnce).to.be.true;

            // Verify tax calculator was used
            expect(mockTaxCalculatorFactory.getTaxCalculator.calledWith('Australia')).to.be.true;
            expect(mockTaxCalculator.calculateIncomeTax.calledOnce).to.be.true;
            expect(mockTaxCalculator.calculateIncomeTax.calledWith(5000, 8000)).to.be.true; // amount, grossIncome

            // Verify response
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({
                incomes: sinon.match.array,
                expenses: mockExpenses
            })).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const errorMessage = 'Database connection failed';
            const mockQuery = {
                sort: sinon.stub().rejects(new Error(errorMessage))
            };
            
            // Setup financial year mock (needed before database error occurs)
            const mockFinancialYear = {
                start: new Date('2025-07-01'),
                end: new Date('2026-06-30'),
                label: 'FY2025-2026'
            };
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);
            
            mockIncomeModel.find.returns(mockQuery);

            await getTax(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });

        it('should not calculate tax for incomes where isTaxPaid is true', async () => {
            const mockIncomes = [
                {
                    _id: 'income1',
                    userId: 'mockUserId123',
                    amount: 5000,
                    dateEarned: new Date(),
                    description: 'Salary',
                    category: 'Salary',
                    source: 'Company',
                    isTaxPaid: true,
                    tax: 750
                }
            ];

            const mockExpenses = [];
            const mockFinancialYear = {
                start: new Date('2025-07-01'),
                end: new Date('2026-06-30'),
                label: 'FY2025-2026'
            };

            const mockIncomeQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            const mockExpenseQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };

            mockIncomeModel.find.returns(mockIncomeQuery);
            mockExpenseModel.find.returns(mockExpenseQuery);
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);

            await getTax(req, res);

            // Tax calculation should not be called for paid taxes
            expect(mockTaxCalculator.calculateIncomeTax.called).to.be.false;
            expect(res.json.calledOnce).to.be.true;
        });
    });

    describe('getTax with different countries', () => {
        it('should use correct tax calculator for US user', async () => {
            req.user.country = 'UnitedStates';
            
            const mockIncomes = [];
            const mockExpenses = [];
            const mockFinancialYear = {
                start: new Date('2024-10-01'),
                end: new Date('2025-09-30'),
                label: 'FY2024-2025'
            };

            const mockIncomeQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            const mockExpenseQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };

            mockIncomeModel.find.returns(mockIncomeQuery);
            mockExpenseModel.find.returns(mockExpenseQuery);
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);

            await getTax(req, res);

            // Verify tax calculator factory was called with correct country
            expect(mockTaxCalculatorFactory.getTaxCalculator.calledWith('UnitedStates')).to.be.true;
            expect(mockFinancialYearCalculatorFactory.getCalculator.calledWith('UnitedStates')).to.be.true;
            
            expect(res.json.calledOnce).to.be.true;
        });

        it('should handle missing user country by defaulting to Australia', async () => {
            req.user.country = undefined;
            
            const mockIncomes = [];
            const mockExpenses = [];
            const mockFinancialYear = {
                start: new Date('2025-07-01'),
                end: new Date('2026-06-30'),
                label: 'FY2025-2026'
            };

            const mockIncomeQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            const mockExpenseQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };

            mockIncomeModel.find.returns(mockIncomeQuery);
            mockExpenseModel.find.returns(mockExpenseQuery);
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);

            await getTax(req, res);

            // Should default to Australia when country is undefined
            expect(mockFinancialYearCalculatorFactory.getCalculator.calledWith('Australia')).to.be.true;
            expect(res.json.calledOnce).to.be.true;
        });
    });

    describe('TaxHandler class integration', () => {
        it('should properly calculate gross income from multiple income sources', async () => {
            const mockIncomes = [
                {
                    _id: 'income1',
                    userId: 'mockUserId123',
                    amount: 3000,
                    dateEarned: new Date(),
                    description: 'Salary',
                    category: 'Salary',
                    source: 'Company',
                    isTaxPaid: false,
                    tax: 0
                },
                {
                    _id: 'income2',
                    userId: 'mockUserId123',
                    amount: 2000,
                    dateEarned: new Date(),
                    description: 'Bonus',
                    category: 'Bonus',
                    source: 'Company',
                    isTaxPaid: false,
                    tax: 0
                }
            ];

            const mockExpenses = [];
            const mockFinancialYear = {
                start: new Date('2025-07-01'),
                end: new Date('2026-06-30'),
                label: 'FY2025-2026'
            };

            const mockIncomeQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            const mockExpenseQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };

            mockIncomeModel.find.returns(mockIncomeQuery);
            mockExpenseModel.find.returns(mockExpenseQuery);
            mockFinancialYearCalculator.getFinancialYear.returns(mockFinancialYear);
            mockTaxCalculator.calculateIncomeTax.returns(500); // Mock tax calculation

            await getTax(req, res);

            // Verify gross income calculation (3000 + 2000 = 5000)
            expect(mockTaxCalculator.calculateIncomeTax.calledTwice).to.be.true;
            expect(mockTaxCalculator.calculateIncomeTax.firstCall.calledWith(3000, 5000)).to.be.true;
            expect(mockTaxCalculator.calculateIncomeTax.secondCall.calledWith(2000, 5000)).to.be.true;
            
            expect(res.json.calledOnce).to.be.true;
        });
    });
});
