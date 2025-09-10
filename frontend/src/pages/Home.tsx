import React, { useEffect } from 'react';
import { 
  ChartContainer, 
  ChartConfig 
} from '../components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Sample data for the chart
const chartData = [
  { month: "January", income: 5000, expenses: 3200 },
  { month: "February", income: 5200, expenses: 3400 },
  { month: "March", income: 4800, expenses: 3100 },
  { month: "April", income: 5300, expenses: 3600 },
  { month: "May", income: 5100, expenses: 3300 },
  { month: "June", income: 5400, expenses: 3700 },
];

// Chart configuration
const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
};

const HomePage: React.FC = () => {
const { user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!user) {
    navigate('/login');
  }
}, [user, navigate]);

if (!user) {
  return null; // Return null while redirecting
}

return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personal Finance Dashboard
        </h1>
        <p className="text-gray-600">
          Track your income and expenses with interactive charts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value}`}
              />
              <Bar 
                dataKey="income" 
                fill="var(--color-income)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="var(--color-expenses)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ${chartData.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold text-red-600">
              ${chartData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibent text-blue-800 mb-2">
              Net Savings
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              ${chartData.reduce((sum, item) => sum + (item.income - item.expenses), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
