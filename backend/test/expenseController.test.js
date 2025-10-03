const mockExpenseModel = {
    find: require('sinon').stub(),
    create: require('sinon').stub(),
    findById: require('sinon').stub(),
    findByIdAndDelete: require('sinon').stub()
};

const mockBudgetModel = {
    find: require('sinon').stub(),
    create: require('sinon').stub(),
    findById: require('sinon').stub(),
    findByIdAndDelete: require('sinon').stub(),
    checkBudgetExceedance: require('sinon').stub()
};

const sharedBudgetCheckStub = require('sinon').stub();

// Create a proper constructor mock that works with 'new' keyword and TypeScript compilation because the builder was not working
function MockBudgetCalculatorConstructor() {
    // This ensures the constructor works properly
    if (!(this instanceof MockBudgetCalculatorConstructor)) {
        return new MockBudgetCalculatorConstructor();
    }
    this.checkBudgetExceedance = sharedBudgetCheckStub;
}

// Add static property to handle TypeScript compiled module access patterns
MockBudgetCalculatorConstructor.BudgetCalculator = MockBudgetCalculatorConstructor;

const mockBudgetCalculator = {
    checkBudgetExceedance: require('sinon').stub()
};

const mockNotificationObserver = {
    getInstance: require('sinon').stub(),
    subscribe: require('sinon').stub(),
    notify: require('sinon').stub()
};

const mockEmailHandler = {
    notify: require('sinon').stub()
};

const mockLogHandler = {
    notify: require('sinon').stub()
};

// Mock all possible model module paths 
// This is a bit hacky, TODO fix up all of the dodgy mixing of common JS and modern ES modules
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id.includes('BudgetCalculator')) {
        // Return the mock immediately when BudgetCalculator is detected
        const mockModule = { 
            BudgetCalculator: MockBudgetCalculatorConstructor,
            BudgetBuilder: function() {}, // Mock for BudgetBuilder if needed
            __esModule: true
        };
        return mockModule;
    }
    if (id === '../models/Expense' || id.includes('Expense')) {
        return { default: mockExpenseModel, ...mockExpenseModel };
    }
    if (id === '../models/Budget' || id.includes('Budget')) {
        return { default: mockBudgetModel, ...mockBudgetModel };
    }

    if (id === '../classes/NotificiationHandler') {
        return {
            NotificationObserver: {
                getInstance: () => ({
                    subscribe: mockNotificationObserver.subscribe,
                    notify: mockNotificationObserver.notify
                })
            },
            EmailNotificationHandler: function() { return mockEmailHandler; },
            LogNotificationHandler: function() { return mockLogHandler; },
            NotificationType: { BUDGET_EXCEEDED: 'BUDGET_EXCEEDED' }
        };
    }
    return originalRequire.apply(this, arguments);
};

const { expect } = require('chai');
const sinon = require('sinon');

// Now require the COMPILED controller after mocking Expense
const { getExpenses, addExpense, getExpenseById, deleteExpense, updateExpense } = require('../dist/controllers/expenseController');

// Restore original require
Module.prototype.require = originalRequire;

describe('Expense Controller Tests - JavaScript/TypeScript Compatible', () => {
    let req;
    let res;
    let statusStub;
    let jsonStub;

    beforeEach(() => {
        // Create fresh request and response mocks for each test
        req = {
            body: {},
            params: {},
            user: { _id: 'mockUserId123' }
        };

        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        
        res = {
            status: statusStub,
            json: jsonStub
        };

        // Reset all stubs
        sinon.resetHistory();
        mockExpenseModel.find.reset();
        mockExpenseModel.create.reset();
        mockExpenseModel.findById.reset();
        mockExpenseModel.findByIdAndDelete.reset();
        mockBudgetModel.checkBudgetExceedance.reset();
        mockBudgetCalculator.checkBudgetExceedance.reset();
        mockNotificationObserver.notify.reset();
        mockEmailHandler.notify.reset();
        mockLogHandler.notify.reset();
        sharedBudgetCheckStub.reset();
        
        // Set up default behavior for budget checking - no budgets exceeded
        sharedBudgetCheckStub.resolves({
            willExceed: false,
            exceededBudgets: []
        });
    });

    describe('getExpenses', () => {
        it('should get all expenses for authenticated user successfully', async () => {
            const mockExpenses = [
                {
                    _id: 'expense1',
                    userId: 'mockUserId123',
                    amount: 50.00,
                    dateSpent: new Date(),
                    description: 'Grocery shopping',
                    category: 'Food',
                    merchant: 'Walmart'
                },
                {
                    _id: 'expense2',
                    userId: 'mockUserId123',
                    amount: 25.00,
                    dateSpent: new Date(),
                    description: 'Gas fill-up',
                    category: 'Transportation',
                    merchant: 'Shell'
                }
            ];

            const mockQuery = {
                sort: sinon.stub().resolves(mockExpenses)
            };
            mockExpenseModel.find.returns(mockQuery);

            await getExpenses(req, res);

            expect(mockExpenseModel.find.calledOnce).to.be.true;
            expect(mockExpenseModel.find.calledWith({ userId: 'mockUserId123' })).to.be.true;
            expect(mockQuery.sort.calledWith({ dateSpent: -1 })).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith(mockExpenses)).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const errorMessage = 'Database connection failed';
            const mockQuery = {
                sort: sinon.stub().rejects(new Error(errorMessage))
            };
            mockExpenseModel.find.returns(mockQuery);

            await getExpenses(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('addExpense', () => {
        it('should create expense creation and trigger budget notification system', async () => {
            const expenseData = {
                amount: 50.00,
                dateSpent: new Date().toISOString(),
                description: 'Grocery shopping',
                category: 'Food',
                merchant: 'Walmart',
                isRecurring: false
            };

            const mockCreatedExpense = {
                _id: 'newExpenseId',
                userId: 'mockUserId123',
                ...expenseData
            };

            req.body = expenseData;
            mockExpenseModel.create.resolves(mockCreatedExpense);

            await addExpense(req, res);

            expect(mockExpenseModel.create.calledOnce).to.be.true;
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith(mockCreatedExpense)).to.be.true;
            expect(sharedBudgetCheckStub.calledOnce).to.be.true;
        });

        it('should create recurring expense with all required fields', async () => {
            const recurringExpenseData = {
                amount: 100.00,
                description: 'Monthly gym membership',
                category: 'Healthcare',
                merchant: 'FitLife Gym',
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: new Date().toISOString()
            };

            const mockCreatedExpense = {
                _id: 'newRecurringExpenseId',
                userId: 'mockUserId123',
                ...recurringExpenseData
            };

            req.body = recurringExpenseData;
            mockExpenseModel.create.resolves(mockCreatedExpense);

            await addExpense(req, res);

            expect(mockExpenseModel.create.calledOnce).to.be.true;
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith(mockCreatedExpense)).to.be.true;
        });

        it('should return error for missing required fields', async () => {
            req.body = {
                amount: 50.00
                // Missing description, category, merchant
            };

            await addExpense(req, res);

            expect(mockExpenseModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Missing required fields: amount, description, category, merchant' 
            })).to.be.true;
        });

        it('should return error for invalid amount', async () => {
            req.body = {
                amount: -50,
                description: 'Test expense',
                category: 'Other',
                merchant: 'Test Store'
            };

            await addExpense(req, res);

            expect(mockExpenseModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Amount must be greater than 0' })).to.be.true;
        });

        it('should return error for recurring expense without frequency', async () => {
            req.body = {
                amount: 100.00,
                description: 'Monthly gym membership',
                category: 'Healthcare',
                merchant: 'FitLife Gym',
                isRecurring: true
                // Missing recurringFrequency
            };

            await addExpense(req, res);

            expect(mockExpenseModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Recurring frequency is required for recurring expenses' 
            })).to.be.true;
        });

        it('should return error for recurring expense without start date', async () => {
            req.body = {
                amount: 100.00,
                description: 'Monthly gym membership',
                category: 'Healthcare',
                merchant: 'FitLife Gym',
                isRecurring: true,
                recurringFrequency: 'Monthly'
                // Missing startDate
            };

            await addExpense(req, res);

            expect(mockExpenseModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Start date is required for recurring expenses' 
            })).to.be.true;
        });

        it('should handle database errors during creation', async () => {
            const errorMessage = 'Database write failed';
            req.body = {
                amount: 50.00,
                description: 'Test expense',
                category: 'Other',
                merchant: 'Test Store'
            };
            mockExpenseModel.create.rejects(new Error(errorMessage));

            await addExpense(req, res);

            // Verifies budget notification system runs first, then database error is handled
            expect(sharedBudgetCheckStub.calledOnce).to.be.true;
            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });

        it('should integrate budget notification system when adding expense', async () => {
            const expenseData = {
                amount: 150.00,
                dateSpent: new Date().toISOString(),
                description: 'Expensive dinner',
                category: 'Food',
                merchant: 'Fancy Restaurant',
                isRecurring: false
            };

            const mockCreatedExpense = {
                _id: 'newExpenseId',
                userId: 'mockUserId123',
                ...expenseData
            };

            const exceededBudgetData = {
                category: 'Food',
                targetAmount: 200.00,
                currentAmount: 100.00,
                newExpenseAmount: 150.00,
                totalAmountAfterExpense: 250.00,
                exceedanceAmount: 50.00,
                exceedancePercentage: 25.0
            };

            mockBudgetCalculator.checkBudgetExceedance.resolves({
                willExceed: true,
                exceededBudgets: [exceededBudgetData]
            });

            req.body = expenseData;
            mockExpenseModel.create.resolves(mockCreatedExpense);

            await addExpense(req, res);

            expect(mockExpenseModel.create.calledOnce).to.be.true;
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith(mockCreatedExpense)).to.be.true;
            expect(sharedBudgetCheckStub.calledOnce).to.be.true;
        });
    });

    describe('getExpenseById', () => {
        it('should get expense by ID successfully', async () => {
            const mockExpenseDoc = {
                _id: 'expenseId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 50.00,
                description: 'Test expense'
            };

            req.params.id = 'expenseId123';
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await getExpenseById(req, res);

            expect(mockExpenseModel.findById.calledWith('expenseId123')).to.be.true;
            expect(res.json.calledWith(mockExpenseDoc)).to.be.true;
        });

        it('should return error if expense not found', async () => {
            req.params.id = 'nonexistentId';
            mockExpenseModel.findById.resolves(null);

            await getExpenseById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Expense not found' })).to.be.true;
        });

        it('should return error if user not authorized', async () => {
            const mockExpenseDoc = {
                userId: { toString: () => 'differentUserId' }
            };

            req.params.id = 'expenseId123';
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await getExpenseById(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Not authorized to view this expense' })).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const errorMessage = 'Database read failed';
            req.params.id = 'expenseId123';
            mockExpenseModel.findById.rejects(new Error(errorMessage));

            await getExpenseById(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('updateExpense', () => {
        it('should update expense successfully', async () => {
            const mockExpenseDoc = {
                _id: 'expenseId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                description: 'Original description',
                category: 'Salary',
                merchant: 'Company',
                isRecurring: false,
                save: sinon.stub().resolves({
                    _id: 'expenseId123',
                    userId: 'mockUserId123',
                    amount: 1500,
                    description: 'Updated description',
                    category: 'Freelance',
                    merchant: 'Client',
                    isRecurring: false
                })
            };

            req.params.id = 'expenseId123';
            req.body = {
                amount: 1500,
                description: 'Updated description',
                category: 'Freelance',
                merchant: 'Client'
            };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(mockExpenseDoc.save.calledOnce).to.be.true;
            expect(mockExpenseDoc.amount).to.equal(1500);
            expect(mockExpenseDoc.description).to.equal('Updated description');
            expect(mockExpenseDoc.category).to.equal('Freelance');
            expect(mockExpenseDoc.merchant).to.equal('Client');
            expect(res.json.calledOnce).to.be.true;
        });

        it('should return error if expense not found for update', async () => {
            req.params.id = 'nonexistentId';
            req.body = { amount: 1500 };
            mockExpenseModel.findById.resolves(null);

            await updateExpense(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Expense not found' })).to.be.true;
        });

        it('should return error if user not authorized to update', async () => {
            const mockExpenseDoc = {
                userId: { toString: () => 'differentUserId' }
            };

            req.params.id = 'expenseId123';
            req.body = { amount: 1500 };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Not authorized to update this expense' })).to.be.true;
        });

        it('should return error for invalid amount update', async () => {
            const mockExpenseDoc = {
                userId: { toString: () => 'mockUserId123' }
            };

            req.params.id = 'expenseId123';
            req.body = { amount: -100 };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Amount must be greater than 0' })).to.be.true;
        });

        it('should update recurring expense fields correctly', async () => {
            const mockExpenseDoc = {
                _id: 'expenseId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                isRecurring: false,
                recurringFrequency: undefined,
                startDate: undefined,
                save: sinon.stub().resolves({
                    _id: 'expenseId123',
                    userId: 'mockUserId123',
                    amount: 1000,
                    isRecurring: true,
                    recurringFrequency: 'Monthly',
                    startDate: '2024-01-01'
                })
            };

            req.params.id = 'expenseId123';
            req.body = {
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: '2024-01-01'
            };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(mockExpenseDoc.isRecurring).to.be.true;
            expect(mockExpenseDoc.recurringFrequency).to.equal('Monthly');
            expect(mockExpenseDoc.startDate).to.equal('2024-01-01');
            expect(mockExpenseDoc.save.calledOnce).to.be.true;
        });

        it('should clear recurring fields when isRecurring is set to false', async () => {
            const mockExpenseDoc = {
                _id: 'expenseId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: '2024-01-01',
                save: sinon.stub().resolves({})
            };

            req.params.id = 'expenseId123';
            req.body = { isRecurring: false };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(mockExpenseDoc.isRecurring).to.be.false;
            expect(mockExpenseDoc.recurringFrequency).to.be.undefined;
            expect(mockExpenseDoc.startDate).to.be.undefined;
            expect(mockExpenseDoc.save.calledOnce).to.be.true;
        });

        it('should handle database errors during update', async () => {
            const errorMessage = 'Database update failed';
            const mockExpenseDoc = {
                userId: { toString: () => 'mockUserId123' },
                save: sinon.stub().rejects(new Error(errorMessage))
            };

            req.params.id = 'expenseId123';
            req.body = { amount: 1500 };
            mockExpenseModel.findById.resolves(mockExpenseDoc);

            await updateExpense(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('deleteExpense', () => {
        it('should delete expense successfully', async () => {
            req.params.id = 'expenseId123';
            mockExpenseModel.findByIdAndDelete.resolves();

            await deleteExpense(req, res);

            expect(mockExpenseModel.findByIdAndDelete.calledOnce).to.be.true;
            expect(mockExpenseModel.findByIdAndDelete.calledWith('expenseId123')).to.be.true;
            expect(res.json.calledWith({ message: 'Expense deleted successfully' })).to.be.true;
        });

        it('should handle database errors during deletion', async () => {
            const errorMessage = 'Database deletion failed';
            req.params.id = 'expenseId123';
            mockExpenseModel.findByIdAndDelete.rejects(new Error(errorMessage));

            await deleteExpense(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });
});
