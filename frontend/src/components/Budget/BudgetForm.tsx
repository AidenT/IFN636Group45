import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';
import { UserResponseData } from '../../types/authTypes';
import { IBudget, BudgetFormData, BUDGET_CATEGORIES, BUDGET_STATUS } from '../../types/budgetTypes';

interface BudgetFormProps {
  budgets: IBudget[];
  setBudgets: React.Dispatch<React.SetStateAction<IBudget[]>>;
  editingBudget: IBudget | null;
  setEditingBudget: React.Dispatch<React.SetStateAction<IBudget | null>>;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budgets, setBudgets, editingBudget, setEditingBudget }) => {
  const { user }: { user: UserResponseData | null } = useAuth();
  const [formData, setFormData] = useState<BudgetFormData>({
    targetAmount: '',
    startDate: new Date().toISOString().split('T')[0], // Today
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    category: 'Food',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        targetAmount: editingBudget.targetAmount.toString(),
        startDate: editingBudget.startDate.toString().split('T')[0], // Convert to YYYY-MM-DD format
        endDate: editingBudget.endDate.toString().split('T')[0], // Convert to YYYY-MM-DD format
        category: editingBudget.category,
        description: editingBudget.description || '',
        status: editingBudget.status || 'Active'
      });
    } else {
      setFormData({
        targetAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Food',
        description: '',
        status: 'Active'
      });
    }
  }, [editingBudget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.token) {
      console.error('User not authenticated');
      return;
    }

    try {
      const budgetData = {
        targetAmount: parseFloat(formData.targetAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        description: formData.description,
        status: formData.status
      };

      if (editingBudget) {
        // Update existing budget
        const response = await axiosInstance.put(`/api/budgets/${editingBudget._id}`, budgetData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const updatedBudget = response.data;
        
        setBudgets(budgets.map(budget => 
          budget._id === editingBudget._id ? updatedBudget : budget
        ));
        setEditingBudget(null);
      } else {
        // Create new budget
        const response = await axiosInstance.post('/api/budgets', budgetData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const newBudget = response.data;
        
        setBudgets([newBudget, ...budgets]);
      }

      // Reset form
      setFormData({
        targetAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Food',
        description: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleCancel = () => {
    setEditingBudget(null);
    setFormData({
      targetAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Food',
      description: '',
      status: 'Active'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingBudget ? 'Edit Budget' : 'Add New Budget'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Amount */}
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount *
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={formData.startDate} // End date must be after start date
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(BUDGET_CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status (only show when editing) */}
          {editingBudget && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(BUDGET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description or notes about this budget goal..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {editingBudget ? 'Update Budget' : 'Add Budget'}
          </button>

          {editingBudget && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;