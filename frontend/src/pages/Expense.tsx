import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ExpenseForm from '../components/Expense/ExpenseForm';
import ExpenseTable from '../components/Expense/ExpenseTable';
import { IExpense } from '../../../backend/models/Expense';
import { IAuthenticatedUser } from '../../../backend/models/User';

const ExpensePage: React.FC = () => {
  const { user }: { user: IAuthenticatedUser | null } = useAuth();
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses when component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/expense', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setExpenses(response.data);
      } catch (err: any) {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchExpenses();
    }
  }, [user]);

  // Delete expense function
  const handleDelete = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/expense/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setExpenses(expenses.filter(expense => expense._id !== expenseId));
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to manage your expenses</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Expenses</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <ExpenseForm
              expenses={expenses}
              setExpenses={setExpenses}
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
            />
          </div>

          <ExpenseTable
            expenses={expenses}
            loading={loading}
            onEdit={setEditingExpense}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
