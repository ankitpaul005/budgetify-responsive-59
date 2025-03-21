
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Line, Cell, Pie, Legend, Bar, Area } from "recharts";
import { format, subMonths, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Transaction, Category } from "@/utils/mockData";
import { Wallet, TrendingUp, TrendingDown, BarChart4, PieChart as PieChartIcon, LucideCalendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Format currency in INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date range options
const dateRanges = [
  { label: "3 Months", value: 3 },
  { label: "6 Months", value: 6 },
  { label: "1 Year", value: 12 },
];

const AnalyticsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [transactions] = useLocalStorage<Transaction[]>(
    `budgetify-transactions-${user?.id || "demo"}`,
    []
  );
  const [categories] = useLocalStorage<Category[]>(
    `budgetify-categories-${user?.id || "demo"}`,
    []
  );
  
  const [dateRange, setDateRange] = useState(6); // Default to 6 months
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Colors for charts
  const COLORS = [
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6B7280",
    "#14B8A6",
  ];
  
  // Get transactions for the selected period
  const getFilteredTransactions = () => {
    const today = new Date();
    const startDate = subMonths(today, dateRange);
    
    return transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= today
    );
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // Calculate monthly income, expenses, and savings
  const getMonthlyData = () => {
    const today = new Date();
    const startDate = subMonths(today, dateRange);
    
    const monthRange = eachMonthOfInterval({
      start: startDate,
      end: today,
    });
    
    return monthRange.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(
        (t) => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        }
      );
      
      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
        
      const savings = income - expenses;
      
      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses,
        savings,
      };
    });
  };
  
  const monthlyData = getMonthlyData();
  
  // Calculate category spending
  const getCategorySpending = () => {
    const categorySpending = categories.map((category) => {
      const total = filteredTransactions
        .filter((t) => t.category === category.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        name: category.name,
        value: total,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }).filter((item) => item.value > 0);
    
    return categorySpending;
  };
  
  const categorySpending = getCategorySpending();
  
  // Calculate income vs expenses
  const calculateIncomeVsExpenses = () => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    return {
      income,
      expenses,
      savings,
      savingsRate,
    };
  };
  
  const incomeVsExpenses = calculateIncomeVsExpenses();
  
  // Calculate top spending categories
  const getTopSpendingCategories = () => {
    return [...categorySpending]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const topCategories = getTopSpendingCategories();
  
  // Get spending by weekday
  const getSpendingByWeekday = () => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const weekdaySpending = weekdays.map((day, index) => {
      const total = filteredTransactions
        .filter((t) => {
          const date = new Date(t.date);
          return date.getDay() === index && t.type === "expense";
        })
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        day,
        amount: total,
      };
    });
    
    return weekdaySpending;
  };
  
  const weekdaySpending = getSpendingByWeekday();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Financial Analytics</h1>
          
          <div className="flex space-x-2">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant={dateRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-blue-light text-budget-blue rounded-full p-2">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(incomeVsExpenses.income)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Last {dateRange} months</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-red-light text-budget-red rounded-full p-2">
              <BarChart4 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(incomeVsExpenses.expenses)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Last {dateRange} months</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Savings
            </h3>
            <p className={`text-3xl font-bold mb-1 ${
              incomeVsExpenses.savings >= 0 ? "text-budget-green" : "text-budget-red"
            }`}>
              {formatCurrency(incomeVsExpenses.savings)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{incomeVsExpenses.savingsRate.toFixed(1)}% savings rate</span>
            </div>
          </GlassmorphicCard>
        </div>
        
        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Income vs. Expenses Over Time</CardTitle>
                <CardDescription>
                  Monthly comparison for the last {dateRange} months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={monthlyData}
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis 
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value).replace(',000', 'k')}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                      />
                      <Legend />
                      <Bar 
                        dataKey="expenses" 
                        fill="#EF4444" 
                        name="Expenses"
                        opacity={0.8}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="income" 
                        fill="#10B981" 
                        name="Income"
                        opacity={0.8}
                        barSize={20}
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#8B5CF6"
                        name="Savings"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </GlassmorphicCard>
            
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="weekday">By Weekday</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>
                      Where your money went in the last {dateRange} months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySpending}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {categorySpending.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), "Spent"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </TabsContent>
              
              <TabsContent value="weekday" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Spending by Day of Week</CardTitle>
                    <CardDescription>
                      When you spend the most money
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={weekdaySpending}
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis 
                            dataKey="day"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(value).replace(',000', 'k')}
                          />
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), "Spent"]}
                          />
                          <Bar 
                            dataKey="amount" 
                            fill="#8B5CF6" 
                            opacity={0.8}
                            barSize={40}
                          >
                            {weekdaySpending.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#0EA5E9"
                            strokeWidth={2}
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Spending Trends</CardTitle>
                    <CardDescription>
                      How your expenses have changed over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyData}
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis 
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(value).replace(',000', 'k')}
                          />
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), "Amount"]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#EF4444"
                            name="Expenses"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#10B981"
                            name="Income"
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
            </Tabs>
          </div>
          
          {/* Right Column - Analytics Insights */}
          <div className="space-y-8">
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Where most of your money goes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.length > 0 ? (
                    topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center">
                        <div
                          className="w-2 h-full min-h-[40px] mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium">{category.name}</h4>
                            <span className="font-medium">
                              {formatCurrency(category.value)}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${(category.value / topCategories[0].value) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length] 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No spending data available
                    </div>
                  )}
                </div>
              </CardContent>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Monthly Savings Rate</CardTitle>
                <CardDescription>
                  Your savings as a percentage of income
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="inline-block relative">
                    <PieChartIcon className="w-20 h-20 text-muted-foreground" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {incomeVsExpenses.savingsRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground text-sm mb-1">Income</div>
                      <div className="font-bold text-budget-green">
                        {formatCurrency(incomeVsExpenses.income)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground text-sm mb-1">Expenses</div>
                      <div className="font-bold text-budget-red">
                        {formatCurrency(incomeVsExpenses.expenses)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-muted-foreground text-sm mb-1">Saved</div>
                    <div className={`font-bold ${
                      incomeVsExpenses.savings >= 0 ? "text-budget-green" : "text-budget-red"
                    }`}>
                      {formatCurrency(incomeVsExpenses.savings)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Financial Insights</CardTitle>
                <CardDescription>
                  Smart observations about your finances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeVsExpenses.savingsRate > 20 && (
                    <div className="flex p-3 bg-budget-green-light/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-budget-green mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-budget-green">Great saving rate!</h4>
                        <p className="text-sm text-muted-foreground">
                          You're saving over 20% of your income. Keep it up!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {incomeVsExpenses.savingsRate < 10 && incomeVsExpenses.savingsRate >= 0 && (
                    <div className="flex p-3 bg-budget-yellow-light/30 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-budget-yellow mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-budget-yellow">Low saving rate</h4>
                        <p className="text-sm text-muted-foreground">
                          Consider reducing expenses to save more of your income.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {incomeVsExpenses.savingsRate < 0 && (
                    <div className="flex p-3 bg-budget-red-light/30 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-budget-red mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-budget-red">Spending more than income</h4>
                        <p className="text-sm text-muted-foreground">
                          You're spending more than you earn. Review your expenses.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {topCategories.length > 0 && (
                    <div className="flex p-3 bg-budget-blue-light/30 rounded-lg">
                      <BarChart4 className="w-5 h-5 text-budget-blue mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-budget-blue">Top spending category</h4>
                        <p className="text-sm text-muted-foreground">
                          Your highest expense is in {topCategories[0].name} at {formatCurrency(topCategories[0].value)}.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {monthlyData.length >= 2 && (
                    <div className="flex p-3 bg-budget-purple-light/30 rounded-lg">
                      <LucideCalendar className="w-5 h-5 text-budget-purple mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-budget-purple">Monthly trend</h4>
                        <p className="text-sm text-muted-foreground">
                          {monthlyData[monthlyData.length - 1].expenses > monthlyData[monthlyData.length - 2].expenses
                            ? "Your expenses increased compared to last month."
                            : "Your expenses decreased compared to last month."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
