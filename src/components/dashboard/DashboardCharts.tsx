
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction, Category } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatting";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { groupTransactionsByCategory, groupTransactionsByMonth } from "@/utils/dashboardUtils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { addMonths, format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

interface DashboardChartsProps {
  transactions: Transaction[];
  categories: Category[];
  budget: any;
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
  // Filter transactions for current month
  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  
  const currentMonthTransactions = transactions.filter((transaction) =>
    isWithinInterval(new Date(transaction.date), {
      start: currentMonthStart,
      end: currentMonthEnd,
    })
  );
  
  // Filter transactions for last month
  const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));
  
  const lastMonthTransactions = transactions.filter((transaction) =>
    isWithinInterval(new Date(transaction.date), {
      start: lastMonthStart,
      end: lastMonthEnd,
    })
  );
  
  // Group transactions by category for current month
  const categorySummary = groupTransactionsByCategory(currentMonthTransactions);
  
  // Group transactions by month
  const monthlySummary = groupTransactionsByMonth(transactions);
  
  // Format data for pie chart
  const pieChartData = Object.entries(categorySummary)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount], index) => ({
      name: category,
      value: amount,
      fill: COLORS[index % COLORS.length],
    }));
  
  // Format data for bar chart
  const barChartData = Object.entries(monthlySummary).map(([month, data]) => ({
    name: month,
    Income: data.income,
    Expenses: data.expenses,
  }));
  
  // Calculate total expenses
  const totalExpenses = pieChartData.reduce((sum, item) => sum + item.value, 0);
  
  const pieChartDataWithPercentage = pieChartData.map(item => ({
    ...item,
    percentage: totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="expenses">Spending Breakdown</TabsTrigger>
          <TabsTrigger value="overview">Monthly Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Current Month Spending</CardTitle>
              <CardDescription>
                Breakdown of expenses by category for {format(currentDate, 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartDataWithPercentage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {pieChartDataWithPercentage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                <p className="font-semibold">{data.name}</p>
                                <p>{formatCurrency(data.value)}</p>
                                <p>{data.percentage}% of total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    No expense data available for this month. Add transactions to see your spending breakdown.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>
                Monthly comparison of your income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace(/\.\d+/, '')} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="Income" fill="#10B981" />
                      <Bar dataKey="Expenses" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    No transaction data available. Add transactions to see your monthly overview.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardCharts;
