import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';
import { IIncome } from '../../../../backend/models/Income';
import { IAuthenticatedUser } from '../../../../backend/models/User';
import { IncomeFormData } from '../../types/income';

interface IncomeFormProps {
  incomes: IIncome[];
  setIncomes: React.Dispatch<React.SetStateAction<IIncome[]>>;
  editingIncome: IIncome | null;
  setEditingIncome: React.Dispatch<React.SetStateAction<IIncome | null>>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ incomes, setIncomes, editingIncome, setEditingIncome }) => {
  const { user }: { user: IAuthenticatedUser | null } = useAuth();
  const [formData, setFormData] = useState<IncomeFormData>({ 
    amount: '',
    dateEarned: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    category: 'Other',
    source: '',
    isRecurring: false,
    recurringFrequency: undefined,
    startDate: undefined
  });

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        amount: editingIncome.amount.toString(),
        dateEarned: editingIncome.dateEarned.toString().split('T')[0], // Convert to YYYY-MM-DD format
        description: editingIncome.description || '',
        category: editingIncome.category,
        source: editingIncome.source || '',
        isRecurring: editingIncome.isRecurring,
        recurringFrequency: editingIncome.recurringFrequency,
        startDate: editingIncome.startDate ? editingIncome.startDate.toString().split('T')[0] : undefined
      });
    } else {
      setFormData({ 
        amount: '',
        dateEarned: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Other',
        source: '',
        isRecurring: false,
        recurringFrequency: undefined,
        startDate: undefined
      });
    }
  }, [editingIncome]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('User not authenticated');
      return;
    }

    if (!formData.amount || !formData.description || !formData.source) {
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
      alert('Please select a start date for recurring income');
      return;
    }

    try {
      const submitData = {
        ...formData,
        amount: amount, // Convert to number
        ...(formData.isRecurring && { recurringFrequency: formData.recurringFrequency }),
        ...(formData.isRecurring && { startDate: formData.startDate })
      };

      if (editingIncome) {
        const response = await axiosInstance.put<IIncome>(`/api/income/${editingIncome._id}`, submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setIncomes(incomes.map((income: IIncome) => (income._id === response.data._id ? response.data : income)));
      } else {
        const response = await axiosInstance.post<IIncome>('/api/income/addIncome', submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setIncomes([...incomes, response.data]);
      }
      setEditingIncome(null);
      setFormData({ 
        amount: '',
        dateEarned: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Other',
        source: '',
        isRecurring: false,
        recurringFrequency: undefined,
        startDate: undefined
      });
    } catch (error: any) {
      console.error('Error saving income:', error);
      alert('Failed to save income. Please try again.');
    }
  };

  const handleInputChange = (field: keyof IncomeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingIncome ? 'Edit Income' : 'Add Income'}</h1>
      
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

      {/* Date Earned Input */}
      <div className="mb-4">
        <label htmlFor="dateEarned" className="block text-sm font-medium text-gray-700 mb-2">
          Date Earned *
        </label>
        <input
          id="dateEarned"
          type="date"
          value={formData.dateEarned}
          onChange={handleInputChange('dateEarned')}
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
          placeholder="Income description"
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
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Investment">Investment</option>
          <option value="Business">Business</option>
          <option value="Gift">Gift</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Source Input */}
      <div className="mb-4">
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
          Source *
        </label>
        <input
          id="source"
          type="text"
          placeholder="Income source (e.g., Company Name, Client)"
          value={formData.source}
          onChange={handleInputChange('source')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Recurring Income Checkbox */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={handleInputChange('isRecurring')}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">This is recurring income</span>
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
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
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
        {editingIncome ? 'Update Income' : 'Add Income'}
      </button>
    </form>
  );
};

export default IncomeForm;