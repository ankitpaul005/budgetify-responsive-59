import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { categorizeTransactions, groupTransactionsByDate } from "@/utils/categoryUtils";
import { motion } from "framer-motion";
import { calculateSummary, groupTransactionsByCategory } from "@/utils/dashboardUtils";
import { formatCurrency } from "@/utils/formatting";
import { TrendingUp, TrendingDown, CreditCard, Calendar, PieChart, BarChart3, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Category } from "@/utils/mockData";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import useLocalStorage from "@/hooks/useLocalStorage";
import InvestmentPortfolio from "@/components/analytics/InvestmentPortfolio";

const AnalyticsPage = () => {
  const { isAuthenticated, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [categorizedData, setCategorizedData] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("month");
  const [sortBy, setSortBy] = useState<string>("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [COLORS] = useState<string[]>([
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f43f5e",
    "#6366f1",
    "#ec4899",
    "#14b8a6",
    "#a855f7",
  ]);

  // Fetch all transactions from Supabase
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
      
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Get categories and investments from localStorage
  const [categories] = useLocalStorage<Category[]>(
    `budgetify-categories-${user?.id || "demo"}`,
    []
  );
  
  const [investments] = useLocalStorage<any[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Process transaction data
  useEffect(() => {
    if (transactions.length > 0) {
      const categorized = categorizeTransactions(transactions, categories);
      setCategorizedData(categorized);
    }
  }, [transactions, categories]);

  // Calculate financial summary
  const summary = useMemo(() => {
    return calculateSummary(transactions, userProfile?.total_income || 0);
  }, [transactions, userProfile?.total_income]);

  // Filter transactions by time period
  const filteredTransactions = useMemo(() => {
    const currentDate = new Date();
    let fromDate = new Date();
    
    switch (timeFilter) {
      case "week":
        fromDate.setDate(currentDate.getDate() - 7);
        break;
      case "month":
        fromDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "quarter":
        fromDate.setMonth(currentDate.getMonth() - 3);
        break;
      case "year":
        fromDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case "all":
      default:
        fromDate = new Date(0); // Oldest possible date
        break;
    }
    
    return transactions.filter(
      (t) => new Date(t.date) >= fromDate && new Date(t.date) <= currentDate
    );
  }, [transactions, timeFilter]);
  
  // Group transactions by category
  const expensesByCategory = useMemo(() => {
    const grouped = groupTransactionsByCategory(filteredTransactions.filter(t => t.type === "expense"));
    
    // Convert to array format for chart with proper sorting
    return Object.entries(grouped)
      .map(([name, value]) => ({
        name: name || "Uncategorized", // Replace empty categories with "Uncategorized"
        value
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => {
        if (sortBy === "amount") {
          return sortOrder === "desc" ? b.value - a.value : a.value - b.value;
        } else {
          // Sort by name
          return sortOrder === "desc" 
            ? b.name.localeCompare(a.name) 
            : a.name.localeCompare(b.name);
        }
      });
  }, [filteredTransactions, sortBy, sortOrder]);
  
  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);
  
  // Convert to arrays for charts
  const dateLabels = Object.keys(transactionsByDate);
  const incomeData = dateLabels.map(date => ({
    date,
    value: transactionsByDate[date].income
  }));
  
  const expenseData = dateLabels.map(date => ({
    date,
    value: transactionsByDate[date].expense
  }));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Layout>
      <motion.div
        className="container mx-auto px-4 py-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green mb-4 md:mb-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Financial Analytics
          </motion.h1>
          
          <div className="flex items-center space-x-2">
            <Select 
              defaultValue={timeFilter} 
              onValueChange={(value) => setTimeFilter(value)}
            >
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
        
        {/* Investment Portfolio Section */}
        <InvestmentPortfolio 
          investments={investments}
          COLORS={COLORS}
        />
        
        {/* Financial Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-budget-green" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.income)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total income this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-budget-red" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.expenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total expenses this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                Savings Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.savingsRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Of income saved this month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Charts Section */}
        <motion.div variants={containerVariants}>
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="expenses" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Spending by Category
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Income & Expense Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="space-y-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Spending by Category</CardTitle>
                      <CardDescription>
                        Breakdown of expenses by category
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select 
                        defaultValue={sortBy} 
                        onValueChange={(value) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-32">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">Amount</SelectItem>
                          <SelectItem value="name">Category</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Pie Chart */}
                      <div className="h-80">
                        {expensesByCategory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={expensesByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {expensesByCategory.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">No expense data available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Category Table */}
                      <div className="overflow-auto max-h-80">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Category</th>
                              <th className="text-right py-2">Amount</th>
                              <th className="text-right py-2">Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expensesByCategory.length > 0 ? (
                              expensesByCategory.map((category, index) => {
                                const totalExpenses = expensesByCategory.reduce(
                                  (sum, cat) => sum + cat.value, 0
                                );
                                const percentage = (category.value / totalExpenses) * 100;
                                
                                return (
                                  <tr key={index} className="border-b">
                                    <td className="py-2 flex items-center">
                                      <span
                                        className="h-3 w-3 rounded-full mr-2"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      ></span>
                                      {category.name}
                                    </td>
                                    <td className="text-right py-2">{formatCurrency(category.value)}</td>
                                    <td className="text-right py-2">{percentage.toFixed(1)}%</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={3} className="text-center py-4 text-muted-foreground">
                                  No expense data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Income & Expense Trends</CardTitle>
                    <CardDescription>
                      Track your financial patterns over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {incomeData.length > 0 || expenseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              allowDuplicatedCategory={false}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value, undefined, true)} 
                            />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                            />
                            <Legend />
                            
                            <Line
                              data={incomeData}
                              type="monotone"
                              dataKey="value"
                              name="Income"
                              stroke="#10b981"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            
                            <Line
                              data={expenseData}
                              type="monotone"
                              dataKey="value"
                              name="Expenses"
                              stroke="#ef4444"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">No transaction data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default AnalyticsPage;
