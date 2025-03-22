
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  AreaChart, PieChart, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Area, Cell, Pie, Legend, Bar, Line, LineChart 
} from "recharts";
import { formatCurrency } from "@/utils/formatting";
import { Category, Budget, Transaction } from "@/utils/mockData";
import { format, parseISO, subDays } from "date-fns";

interface DashboardChartsProps {
  transactions: Transaction[];
  categories: Category[];
  budget: Budget;
  userIncome?: number;
  COLORS: string[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  transactions,
  categories,
  budget,
  userIncome = 0,
  COLORS,
}) => {
  // Create expense by category data only for categories that have transactions
  const expenseByCategory = categories.map((category) => {
    const total = transactions
      .filter((t) => t.category === category.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      name: category.name,
      value: total,
    };
  }).filter((item) => item.value > 0);
  
  // Use monthly income to generate estimated category budgets for empty charts
  const generateBudgetEstimates = () => {
    if (!userIncome || expenseByCategory.length > 0) return expenseByCategory;
    
    // Only generate estimates if there are no actual expenses
    return categories
      .filter(cat => cat.budget)
      .map(category => {
        // Using category's budget percentage to calculate from total income
        const estimatedBudget = (category.budget || 0) / 3000 * (userIncome / 12);
        return {
          name: category.name,
          value: 0, // No actual value, just for chart rendering
          budget: Math.round(estimatedBudget)
        };
      });
  };
  
  const chartData = expenseByCategory.length > 0 ? expenseByCategory : generateBudgetEstimates();
  
  // Generate daily spending data based on actual transactions
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dayTransactions = transactions.filter(
      (t) =>
        t.type === "expense" &&
        format(parseISO(t.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    
    const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: format(date, "MMM dd"),
      amount: totalSpent,
    };
  });
  
  // Generate budget vs actual data based on income if no transactions
  const generateBudgetVsActual = () => {
    const result = categories
      .filter(cat => cat.budget)
      .map((category) => {
        const budgetItem = budget.categories.find((b) => b.categoryId === category.id);
        const spent = transactions
          .filter(
            (t) =>
              t.category === category.id &&
              t.type === "expense" &&
              new Date(t.date) >= new Date(budget.startDate)
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        // If no budget set but we have income, generate a reasonable budget
        const estimatedBudget = userIncome 
          ? ((category.budget || 0) / 3000) * (userIncome / 12)
          : 0;
        
        return {
          name: category.name,
          budget: budgetItem?.limit || estimatedBudget,
          spent: spent,
        };
      });
    
    return result.filter(item => item.budget > 0 || item.spent > 0);
  };
  
  const budgetVsActual = generateBudgetVsActual();

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="spending">Spending</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <GlassmorphicCard>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              Your financial activity for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : `${name}`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Amount",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassmorphicCard>
        
        <GlassmorphicCard>
          <CardHeader className="pb-2">
            <CardTitle>Daily Spending</CardTitle>
            <CardDescription>
              Your spending over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={last30Days}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 25,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    angle={-45}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value === 0 ? "0" : `₹${value}`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Spent",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassmorphicCard>
      </TabsContent>
      
      <TabsContent value="spending" className="space-y-6">
        <GlassmorphicCard>
          <CardHeader className="pb-2">
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Where your money is going this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 80,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value === 0 ? "0" : `₹${value}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Spent",
                    ]}
                  />
                  <Bar dataKey="value" fill="#0EA5E9">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassmorphicCard>
      </TabsContent>
      
      <TabsContent value="budget" className="space-y-6">
        <GlassmorphicCard>
          <CardHeader className="pb-2">
            <CardTitle>Budget vs. Actual</CardTitle>
            <CardDescription>
              How you're tracking against your budget this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetVsActual}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 25,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    angle={-45}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value === 0 ? "0" : `₹${value}`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Amount",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="budget"
                    fill="#8B5CF6"
                    name="Budget"
                  />
                  <Bar
                    dataKey="spent"
                    fill="#10B981"
                    name="Actual"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassmorphicCard>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardCharts;
