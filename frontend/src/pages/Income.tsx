import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import IncomeForm from '../components/Income/IncomeForm';
import IncomeTable from '../components/Income/IncomeTable';
import { IIncome } from '../../../backend/models/Income';
import { IAuthenticatedUser } from '../../../backend/models/User';

const IncomePage: React.FC = () => {
  const { user }: { user: IAuthenticatedUser | null } = useAuth();
  const [incomes, setIncomes] = useState<IIncome[]>([]);
  const [editingIncome, setEditingIncome] = useState<IIncome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch incomes when component mounts
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/income', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setIncomes(response.data);
      } catch (err: any) {
        console.error('Error fetching incomes:', err);
        setError('Failed to load incomes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchIncomes();
    }
  }, [user]);

  // Delete income function
  const handleDelete = async (incomeId: string) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/income/${incomeId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setIncomes(incomes.filter(income => income._id !== incomeId));
    } catch (err: any) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to manage your income</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Income</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h2>
            <IncomeForm
              incomes={incomes}
              setIncomes={setIncomes}
              editingIncome={editingIncome}
              setEditingIncome={setEditingIncome}
            />
          </div>

          <IncomeTable
            incomes={incomes}
            loading={loading}
            onEdit={setEditingIncome}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
