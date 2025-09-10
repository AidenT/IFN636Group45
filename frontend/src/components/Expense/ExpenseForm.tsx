import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';
import { IExpense } from '../../../../backend/models/Expense';
import { IAuthenticatedUser } from '../../../../backend/models/User';
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES, ExpenseFormData } from '../../types/expense';

interface ExpenseFormProps {
  expenses: IExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<IExpense[]>>;
  editingExpense: IExpense | null;
  setEditingExpense: React.Dispatch<React.SetStateAction<IExpense | null>>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenses, setExpenses, editingExpense, setEditingExpense }) => {
  const { user }: { user: IAuthenticatedUser | null } = useAuth();
  const [formData, setFormData] = useState<ExpenseFormData>({ 
    amount: '',
    dateSpent: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    category: 'Other',
    merchant: '',
    isRecurring: false,
    recurringFrequency: undefined,
    startDate: undefined
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        amount: editingExpense.amount.toString(),
        dateSpent: editingExpense.dateSpent.toString().split('T')[0], // Convert to YYYY-MM-DD format
        description: editingExpense.description || '',
        category: editingExpense.category,
        merchant: editingExpense.merchant || '',
        isRecurring: editingExpense.isRecurring,
        recurringFrequency: editingExpense.recurringFrequency,
        startDate: editingExpense.startDate ? editingExpense.startDate.toString().split('T')[0] : undefined
      });
    } else {
      setFormData({ 
        amount: '',
        dateSpent: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Other',
        merchant: '',
        isRecurring: false,
        recurringFrequency: undefined,
        startDate: undefined
      });
    }
  }, [editingExpense]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('User not authenticated');
      return;
    }

    if (!formData.amount || !formData.description || !formData.merchant) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    if (formData.isRecurring && !formData.recurringFrequency) {
      alert('Please select a recurring frequency');
      return;
    }

    if (formData.isRecurring && !formData.startDate) {
      alert('Please select a start date for recurring expense');
      return;
    }

    try {
      const submitData = {
        ...formData,
        amount: amount, // Convert to number
        ...(formData.isRecurring && { recurringFrequency: formData.recurringFrequency }),
        ...(formData.isRecurring && { startDate: formData.startDate })
      };

      if (editingExpense) {
        const response = await axiosInstance.put<IExpense>(`/api/expense/${editingExpense._id}`, submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setExpenses(expenses.map((expense: IExpense) => (expense._id === response.data._id ? response.data : expense)));
      } else {
        const response = await axiosInstance.post<IExpense>('/api/expense/addExpense', submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setExpenses([...expenses, response.data]);
      }
      setEditingExpense(null);
      setFormData({ 
        amount: '',
        dateSpent: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Other',
        merchant: '',
        isRecurring: false,
        recurringFrequency: undefined,
        startDate: undefined
      });
    } catch (error: any) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h1>

      {/* Amount Input */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleInputChange('amount')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Date Spent Input */}
      <div className="mb-4">
        <label htmlFor="dateSpent" className="block text-sm font-medium text-gray-700 mb-2">
          Date Spent *
        </label>
        <input
          id="dateSpent"
          type="date"
          value={formData.dateSpent}
          onChange={handleInputChange('dateSpent')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <input
          id="description"
          type="text"
          placeholder="Expense description"
          value={formData.description}
          onChange={handleInputChange('description')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Category Select */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={handleInputChange('category')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        >
          {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Merchant Input */}
      <div className="mb-4">
        <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-2">
          Merchant *
        </label>
        <input
          id="merchant"
          type="text"
          placeholder="Merchant name (e.g., Store Name)"
          value={formData.merchant}
          onChange={handleInputChange('merchant')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Recurring Expense Checkbox */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={handleInputChange('isRecurring')}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">This is recurring expense</span>
        </label>
      </div>

      {/* Recurring Frequency (shown only if recurring) */}
      {formData.isRecurring && (
        <div className="mb-4">
          <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-700 mb-2">
            Recurring Frequency *
          </label>
          <select
            id="recurringFrequency"
            value={formData.recurringFrequency || ''}
            onChange={handleInputChange('recurringFrequency')}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required={formData.isRecurring}
          >
            <option value="">Select frequency...</option>
            {Object.entries(RECURRING_FREQUENCIES).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Start Date (shown only if recurring) */}
      {formData.isRecurring && (
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={handleInputChange('startDate')}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required={formData.isRecurring}
          />
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
        disabled={!user?.token}
      >
        {editingExpense ? 'Update Expense' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;