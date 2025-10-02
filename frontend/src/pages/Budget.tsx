import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import BudgetForm from '../components/Budget/BudgetForm';
import BudgetTable from '../components/Budget/BudgetTable';
import { IBudget } from '../types/budgetTypes';
import { UserResponseData } from '../types/authTypes';

const BudgetPage: React.FC = () => {
  const { user }: { user: UserResponseData | null } = useAuth();
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch budgets when component mounts
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/budgets', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setBudgets(response.data);
      } catch (err: any) {
        console.error('Error fetching budgets:', err);
        setError('Failed to load budgets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBudgets();
    }
  }, [user]);

  // Delete budget function
  const handleDelete = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this budget goal?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/budgets/${budgetId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setBudgets(budgets.filter(budget => budget._id !== budgetId));
    } catch (err: any) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget. Please try again.');
    }
  };



  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to manage your budget goals</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Budget Goals</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Budget Form */}
          <BudgetForm
            budgets={budgets}
            setBudgets={setBudgets}
            editingBudget={editingBudget}
            setEditingBudget={setEditingBudget}
          />

          {/* Budget Table */}
          <BudgetTable
            budgets={budgets}
            loading={loading}
            onEdit={setEditingBudget}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;