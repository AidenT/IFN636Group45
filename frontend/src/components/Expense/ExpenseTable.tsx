import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { IExpense } from '../../../../backend/models/Expense';
import { EXPENSE_CATEGORIES } from '../../types/expense';

interface ExpenseTableProps {
  expenses: IExpense[];
  loading: boolean;
  onEdit: (expense: IExpense) => void;
  onDelete: (expenseId: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  loading,
  onEdit,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter expenses based on selected category
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Expense Records</h2>
        {expenses.length > 0 && (
          <div className="text-lg font-bold text-red-600">
            Total: ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            {selectedCategory !== 'all' && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (filtered)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700">
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {selectedCategory !== 'all' && (
            <span className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </span>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading expenses...</div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {selectedCategory === 'all' 
            ? 'No expense records found. Add your first expense entry!'
            : `No expenses found for category "${selectedCategory}". Try selecting a different category.`
          }
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Spent</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow
                  key={expense._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEdit(expense)}
                >
                  <TableCell className="font-medium">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    {expense.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(expense.dateSpent).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {expense.merchant || '-'}
                  </TableCell>
                  <TableCell>
                    {expense.isRecurring ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {expense.recurringFrequency}
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* Edit happens in ExpenseForm */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(expense);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(expense._id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
