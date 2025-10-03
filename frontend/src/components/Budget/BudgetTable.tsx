import React, { useMemo, useState } from 'react';
import { BUDGET_CATEGORIES, IBudget, BUDGET_STATUS } from '../../types/budgetTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface BudgetTableProps {
  budgets: IBudget[];
  loading: boolean;
  onEdit: (budget: IBudget) => void;
  onDelete: (budgetId: string) => void;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  budgets = [], // Default to empty array if undefined/null
  loading,
  onEdit,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter budgets based on selected category and status
  const filteredBudgets = useMemo(() => {
    let filtered = budgets;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(budget => budget.category === selectedCategory);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(budget => budget.status === selectedStatus);
    }
    
    return filtered;
  }, [budgets, selectedCategory, selectedStatus]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const calculateProgress = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (targetDate: Date | string): number => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  // Calculate days remaining until end of budget period
  const getDaysUntilEnd = (endDate: string | Date) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Budget Goals</h2>
        {budgets.length > 0 && (
          <div className="text-lg font-bold text-blue-600">
            Total Target: ${filteredBudgets.reduce((sum, budget) => sum + budget.targetAmount, 0).toFixed(2)}
            {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (filtered)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700">
            Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.values(BUDGET_CATEGORIES).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {Object.values(BUDGET_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <span className="text-sm text-gray-600 self-center">
            Showing {filteredBudgets.length} of {budgets.length} budgets
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading budgets...</div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {budgets.length === 0
            ? 'No budget goals found. Create your first budget to start tracking your budget!'
            : 'No budgets match your current filters. Try adjusting the category or status filters.'
          }
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Budget Amount</TableHead>
                <TableHead>Spent Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const progress = calculateProgress(budget.currentAmount || 0, budget.targetAmount);
                const daysRemaining = getDaysUntilEnd(budget.endDate);
                
                return (
                  <TableRow
                    key={budget._id}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{budget.description || 'Unnamed Goal'}</div>
                        <div className="text-sm text-gray-500">{budget.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{progress.toFixed(1)}%</span>
                          <span>${(budget.currentAmount || 0).toFixed(2)} / ${budget.targetAmount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${budget.targetAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span>${(budget.currentAmount || 0).toFixed(2)}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {budget.currentAmount ? 'Auto-calculated from expenses' : 'No expenses yet'}
                      </div>
                    </TableCell>
                    <TableCell>{budget.category}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(budget.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to</div>
                        <div>{new Date(budget.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={daysRemaining <= 7 ? 'text-red-600 font-semibold' : daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-600'}>
                        {daysRemaining} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(budget.status || 'Active')}`}>
                        {budget.status || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(budget)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(budget._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BudgetTable;