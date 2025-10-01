import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { UserResponseData } from '../types/authTypes';

interface TaxRecord {
  _id?: string;
  amount: number;
  dateEarned?: Date;
  dateSpent?: Date;
  description: string;
  category?: string;
  merchant?: string;
  tax?: number;
  type: 'income' | 'expense';
}

interface TaxData {
  incomes: TaxRecord[];
  expenses: TaxRecord[];
}

const TaxPage: React.FC = () => {
  const { user }: { user: UserResponseData | null } = useAuth();
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/api/tax', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = response.data;
      
      // Transform the data to include type information
      const transformedData: TaxData = {
        incomes: data.incomes?.map((income: any) => ({
          ...income,
          type: 'income' as const
        })) || [],
        expenses: data.expenses?.map((expense: any) => ({
          ...expense,
          type: 'expense' as const
        })) || []
      };
      
      setTaxData(transformedData);
    } catch (err: any) {
      console.error('Error fetching tax data:', err);
      setError(err.response?.data?.message || 'Failed to fetch tax data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTaxData();
    }
  }, [user, fetchTaxData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-AU');
  };

  const calculateTotalTax = (records: TaxRecord[]): number => {
    return records.reduce((total, record) => total + (record.tax || 0), 0);
  };

  const calculateTotalAmount = (records: TaxRecord[]): number => {
    return records.reduce((total, record) => total + record.amount, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in to view your tax information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tax data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
            <button 
              onClick={fetchTaxData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tax Summary</h1>
          <p className="text-gray-600 mt-2">
            View your financial year tax calculations and records
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(calculateTotalAmount(taxData?.incomes || []))}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(calculateTotalAmount(taxData?.expenses || []))}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Income Tax</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculateTotalTax(taxData?.incomes || []))}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tax</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(calculateTotalTax([...(taxData?.incomes || []), ...(taxData?.expenses || [])]))}
            </p>
          </div>
        </div>

        {/* Income Records */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Income Records</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {taxData?.incomes && taxData.incomes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taxData.incomes.map((income, index) => (
                      <tr key={income._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(income.dateEarned)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {income.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {formatCurrency(income.tax || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No income records found for this financial year.
              </div>
            )}
          </div>
        </div>

        {/* Expense Records */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expense Records</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {taxData?.expenses && taxData.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Merchant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taxData.expenses.map((expense, index) => (
                      <tr key={expense._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.dateSpent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.merchant || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {formatCurrency(expense.tax || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No expense records found for this financial year.
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchTaxData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Tax Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxPage;
