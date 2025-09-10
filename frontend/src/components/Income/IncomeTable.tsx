import React from 'react';
import { IIncome } from '../../../../backend/models/Income';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface IncomeTableProps {
  incomes: IIncome[];
  loading: boolean;
  onEdit: (income: IIncome) => void;
  onDelete: (incomeId: string) => void;
}

const IncomeTable: React.FC<IncomeTableProps> = ({
  incomes,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Income Records</h2>
        {incomes.length > 0 && (
          <div className="text-lg font-bold text-green-600">
            Total: ${incomes.reduce((sum, income) => sum + income.amount, 0).toFixed(2)}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading incomes...</div>
      ) : incomes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No income records found. Add your first income entry!
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Earned</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow
                  key={income._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEdit(income)}
                >
                  <TableCell className="font-medium">
                    ${income.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{income.category}</TableCell>
                  <TableCell>
                    {income.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(income.dateEarned).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {income.source || '-'}
                  </TableCell>
                  <TableCell>
                    {income.isRecurring ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {income.recurringFrequency}
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* Edit happens in IncomeForm */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(income);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(income._id);
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

export default IncomeTable;
