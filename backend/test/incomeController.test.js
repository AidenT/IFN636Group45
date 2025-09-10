// Mock the Income module before requiring anything else
const mockIncomeModel = {
    find: require('sinon').stub(),
    create: require('sinon').stub(),
    findById: require('sinon').stub(),
    findByIdAndDelete: require('sinon').stub()
};

// Mock all possible Income module paths
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id === '../models/Income' || id.includes('Income')) {
        return { default: mockIncomeModel, ...mockIncomeModel };
    }
    return originalRequire.apply(this, arguments);
};

const { expect } = require('chai');
const sinon = require('sinon');

// Now require the COMPILED controller after mocking Income
const { getIncomes, addIncome, getIncomeById, updateIncome, deleteIncome } = require('../dist/controllers/incomeController');

// Restore original require
Module.prototype.require = originalRequire;

describe('Income Controller Tests - JavaScript/TypeScript Compatible', () => {
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
        mockIncomeModel.find.reset();
        mockIncomeModel.create.reset();
        mockIncomeModel.findById.reset();
        mockIncomeModel.findByIdAndDelete.reset();
    });

    describe('getIncomes', () => {
        it('should get all incomes for authenticated user successfully', async () => {
            const mockIncomes = [
                {
                    _id: 'income1',
                    userId: 'mockUserId123',
                    amount: 1000,
                    dateEarned: new Date(),
                    description: 'Salary',
                    category: 'Salary',
                    source: 'Company'
                },
                {
                    _id: 'income2',
                    userId: 'mockUserId123',
                    amount: 500,
                    dateEarned: new Date(),
                    description: 'Freelance',
                    category: 'Freelance',
                    source: 'Client'
                }
            ];

            const mockQuery = {
                sort: sinon.stub().resolves(mockIncomes)
            };
            mockIncomeModel.find.returns(mockQuery);

            await getIncomes(req, res);

            expect(mockIncomeModel.find.calledOnce).to.be.true;
            expect(mockIncomeModel.find.calledWith({ userId: 'mockUserId123' })).to.be.true;
            expect(mockQuery.sort.calledWith({ dateEarned: -1 })).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith(mockIncomes)).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const errorMessage = 'Database connection failed';
            const mockQuery = {
                sort: sinon.stub().rejects(new Error(errorMessage))
            };
            mockIncomeModel.find.returns(mockQuery);

            await getIncomes(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('addIncome', () => {
        it('should create a new income successfully', async () => {
            const incomeData = {
                amount: 1000,
                dateEarned: new Date().toISOString(),
                description: 'Monthly salary',
                category: 'Salary',
                source: 'Company ABC',
                isRecurring: false
            };

            const mockCreatedIncome = {
                _id: 'newIncomeId',
                userId: 'mockUserId123',
                ...incomeData
            };

            req.body = incomeData;
            mockIncomeModel.create.resolves(mockCreatedIncome);

            await addIncome(req, res);

            expect(mockIncomeModel.create.calledOnce).to.be.true;
            expect(mockIncomeModel.create.calledWith(sinon.match({
                userId: 'mockUserId123',
                amount: 1000,
                description: 'Monthly salary',
                category: 'Salary',
                source: 'Company ABC',
                isRecurring: false
            }))).to.be.true;
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith(mockCreatedIncome)).to.be.true;
        });

        it('should create recurring income with all required fields', async () => {
            const recurringIncomeData = {
                amount: 2000,
                description: 'Monthly salary',
                category: 'Salary',
                source: 'Company ABC',
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: new Date().toISOString()
            };

            const mockCreatedIncome = {
                _id: 'newRecurringIncomeId',
                userId: 'mockUserId123',
                ...recurringIncomeData
            };

            req.body = recurringIncomeData;
            mockIncomeModel.create.resolves(mockCreatedIncome);

            await addIncome(req, res);

            expect(mockIncomeModel.create.calledOnce).to.be.true;
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith(mockCreatedIncome)).to.be.true;
        });

        it('should return error for missing required fields', async () => {
            req.body = {
                amount: 1000
                // Missing description, category, source
            };

            await addIncome(req, res);

            expect(mockIncomeModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Missing required fields: amount, description, category, source' 
            })).to.be.true;
        });

        it('should return error for invalid amount', async () => {
            req.body = {
                amount: -100,
                description: 'Test',
                category: 'Other',
                source: 'Test Source'
            };

            await addIncome(req, res);

            expect(mockIncomeModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Amount must be greater than 0' })).to.be.true;
        });

        it('should return error for recurring income without frequency', async () => {
            req.body = {
                amount: 1000,
                description: 'Monthly salary',
                category: 'Salary',
                source: 'Company ABC',
                isRecurring: true
                // Missing recurringFrequency
            };

            await addIncome(req, res);

            expect(mockIncomeModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Recurring frequency is required for recurring income' 
            })).to.be.true;
        });

        it('should return error for recurring income without start date', async () => {
            req.body = {
                amount: 1000,
                description: 'Monthly salary',
                category: 'Salary',
                source: 'Company ABC',
                isRecurring: true,
                recurringFrequency: 'Monthly'
                // Missing startDate
            };

            await addIncome(req, res);

            expect(mockIncomeModel.create.called).to.be.false;
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ 
                message: 'Start date is required for recurring income' 
            })).to.be.true;
        });

        it('should handle database errors during creation', async () => {
            const errorMessage = 'Database write failed';
            req.body = {
                amount: 1000,
                description: 'Test income',
                category: 'Other',
                source: 'Test Source'
            };
            mockIncomeModel.create.rejects(new Error(errorMessage));

            await addIncome(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('getIncomeById', () => {
        it('should get income by ID successfully', async () => {
            const mockIncomeDoc = {
                _id: 'incomeId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                description: 'Test income'
            };

            req.params.id = 'incomeId123';
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await getIncomeById(req, res);

            expect(mockIncomeModel.findById.calledWith('incomeId123')).to.be.true;
            expect(res.json.calledWith(mockIncomeDoc)).to.be.true;
        });

        it('should return error if income not found', async () => {
            req.params.id = 'nonexistentId';
            mockIncomeModel.findById.resolves(null);

            await getIncomeById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Income not found' })).to.be.true;
        });

        it('should return error if user not authorized', async () => {
            const mockIncomeDoc = {
                userId: { toString: () => 'differentUserId' }
            };

            req.params.id = 'incomeId123';
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await getIncomeById(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Not authorized to view this income' })).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const errorMessage = 'Database read failed';
            req.params.id = 'incomeId123';
            mockIncomeModel.findById.rejects(new Error(errorMessage));

            await getIncomeById(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('updateIncome', () => {
        it('should update income successfully', async () => {
            const mockIncomeDoc = {
                _id: 'incomeId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                description: 'Original description',
                category: 'Salary',
                source: 'Company',
                isRecurring: false,
                save: sinon.stub().resolves({
                    _id: 'incomeId123',
                    userId: 'mockUserId123',
                    amount: 1500,
                    description: 'Updated description',
                    category: 'Freelance',
                    source: 'Client',
                    isRecurring: false
                })
            };

            req.params.id = 'incomeId123';
            req.body = {
                amount: 1500,
                description: 'Updated description',
                category: 'Freelance',
                source: 'Client'
            };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(mockIncomeDoc.save.calledOnce).to.be.true;
            expect(mockIncomeDoc.amount).to.equal(1500);
            expect(mockIncomeDoc.description).to.equal('Updated description');
            expect(mockIncomeDoc.category).to.equal('Freelance');
            expect(mockIncomeDoc.source).to.equal('Client');
            expect(res.json.calledOnce).to.be.true;
        });

        it('should return error if income not found for update', async () => {
            req.params.id = 'nonexistentId';
            req.body = { amount: 1500 };
            mockIncomeModel.findById.resolves(null);

            await updateIncome(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Income not found' })).to.be.true;
        });

        it('should return error if user not authorized to update', async () => {
            const mockIncomeDoc = {
                userId: { toString: () => 'differentUserId' }
            };

            req.params.id = 'incomeId123';
            req.body = { amount: 1500 };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Not authorized to update this income' })).to.be.true;
        });

        it('should return error for invalid amount update', async () => {
            const mockIncomeDoc = {
                userId: { toString: () => 'mockUserId123' }
            };

            req.params.id = 'incomeId123';
            req.body = { amount: -100 };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Amount must be greater than 0' })).to.be.true;
        });

        it('should update recurring income fields correctly', async () => {
            const mockIncomeDoc = {
                _id: 'incomeId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                isRecurring: false,
                recurringFrequency: undefined,
                startDate: undefined,
                save: sinon.stub().resolves({
                    _id: 'incomeId123',
                    userId: 'mockUserId123',
                    amount: 1000,
                    isRecurring: true,
                    recurringFrequency: 'Monthly',
                    startDate: '2024-01-01'
                })
            };

            req.params.id = 'incomeId123';
            req.body = {
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: '2024-01-01'
            };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(mockIncomeDoc.isRecurring).to.be.true;
            expect(mockIncomeDoc.recurringFrequency).to.equal('Monthly');
            expect(mockIncomeDoc.startDate).to.equal('2024-01-01');
            expect(mockIncomeDoc.save.calledOnce).to.be.true;
        });

        it('should clear recurring fields when isRecurring is set to false', async () => {
            const mockIncomeDoc = {
                _id: 'incomeId123',
                userId: { toString: () => 'mockUserId123' },
                amount: 1000,
                isRecurring: true,
                recurringFrequency: 'Monthly',
                startDate: '2024-01-01',
                save: sinon.stub().resolves({})
            };

            req.params.id = 'incomeId123';
            req.body = { isRecurring: false };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(mockIncomeDoc.isRecurring).to.be.false;
            expect(mockIncomeDoc.recurringFrequency).to.be.undefined;
            expect(mockIncomeDoc.startDate).to.be.undefined;
            expect(mockIncomeDoc.save.calledOnce).to.be.true;
        });

        it('should handle database errors during update', async () => {
            const errorMessage = 'Database update failed';
            const mockIncomeDoc = {
                userId: { toString: () => 'mockUserId123' },
                save: sinon.stub().rejects(new Error(errorMessage))
            };

            req.params.id = 'incomeId123';
            req.body = { amount: 1500 };
            mockIncomeModel.findById.resolves(mockIncomeDoc);

            await updateIncome(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });

    describe('deleteIncome', () => {
        it('should delete income successfully', async () => {
            req.params.id = 'incomeId123';
            mockIncomeModel.findByIdAndDelete.resolves();

            await deleteIncome(req, res);

            expect(mockIncomeModel.findByIdAndDelete.calledOnce).to.be.true;
            expect(mockIncomeModel.findByIdAndDelete.calledWith('incomeId123')).to.be.true;
            expect(res.json.calledWith({ message: 'Income deleted successfully' })).to.be.true;
        });

        it('should return error if income not found for deletion', async () => {
            req.params.id = 'nonexistentId';
            mockIncomeModel.findByIdAndDelete.rejects(new Error('Income not found'));

            await deleteIncome(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: 'Income not found' })).to.be.true;
        });

        it('should handle database errors during deletion', async () => {
            const errorMessage = 'Database deletion failed';
            req.params.id = 'incomeId123';
            mockIncomeModel.findByIdAndDelete.rejects(new Error(errorMessage));

            await deleteIncome(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWith({ message: errorMessage })).to.be.true;
        });
    });
});
