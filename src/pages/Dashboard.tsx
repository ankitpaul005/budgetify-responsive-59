
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line, Cell, Pie, Legend } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Transaction, Category, Budget } from "@/utils/mockData";
import { ArrowUpRight, ArrowDownRight, Wallet, CircleDollarSign, PiggyBank, CreditCard, Settings, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Calculate summary data
const calculateSummary = (transactions: Transaction[]) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Filter current month transactions
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  // Calculate income and expenses
  const income = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  
  return {
    income,
    expenses,
    balance,
    savingsRate,
  };
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    `budgetify-transactions-${user?.id || "demo"}`,
    []
  );
  const [categories] = useLocalStorage<Category[]>(
    `budgetify-categories-${user?.id || "demo"}`,
    []
  );
  const [budget] = useLocalStorage<Budget>(
    `budgetify-budget-${user?.id || "demo"}`,
    { id: "", amount: 0, period: "monthly", startDate: "", categories: [] }
  );
  
  const [searchTerm, setSearchTerm] = useState("");
  const [timeframe, setTimeframe] = useState("month");
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense",
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Calculate summary
  const summary = calculateSummary(transactions);
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? `text-${category.color}` : "text-gray-500";
  };
  
  // Add new transaction
  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const newTrans: Transaction = {
      id: crypto.randomUUID(),
      amount,
      description: newTransaction.description,
      category: newTransaction.category,
      type: newTransaction.type as "income" | "expense",
      date: new Date().toISOString(),
    };
    
    setTransactions([newTrans, ...transactions]);
    setNewTransaction({
      amount: "",
      description: "",
      category: "",
      type: "expense",
    });
    
    toast.success("Transaction added successfully");
  };
  
  // Prepare data for expense by category chart
  const expenseByCategory = categories.map((category) => {
    const total = transactions
      .filter((t) => t.category === category.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      name: category.name,
      value: total,
    };
  }).filter((item) => item.value > 0);
  
  // Colors for pie chart
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
  
  // Prepare data for spending over time chart
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
  
  // Budget vs actual data
  const budgetVsActual = categories.map((category) => {
    const budgetItem = budget.categories.find((b) => b.categoryId === category.id);
    const spent = transactions
      .filter(
        (t) =>
          t.category === category.id &&
          t.type === "expense" &&
          new Date(t.date) >= new Date(budget.startDate)
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      budget: budgetItem?.limit || 0,
      spent: spent,
    };
  }).filter((item) => item.budget > 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.name || "User"}
        </h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Current Balance
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(summary.balance)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              {summary.balance > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-budget-green mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-budget-red mr-1" />
              )}
              <span>This month</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-blue-light text-budget-blue rounded-full p-2">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(summary.income)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowUpRight className="w-4 h-4 text-budget-green mr-1" />
              <span>This month</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-red-light text-budget-red rounded-full p-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(summary.expenses)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowDownRight className="w-4 h-4 text-budget-red mr-1" />
              <span>This month</span>
            </div>
          </GlassmorphicCard>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
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
                            data={expenseByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {expenseByCategory.map((entry, index) => (
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
                              value === 0 ? "0" : `$${value}`
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
                          data={expenseByCategory}
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
                              value === 0 ? "0" : `$${value}`
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
                            {expenseByCategory.map((entry, index) => (
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
                              value === 0 ? "0" : `$${value}`
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
          </div>
          
          {/* Right Column - Transactions */}
          <div className="space-y-8">
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>
                  Record your income or expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={
                        newTransaction.type === "expense" ? "default" : "outline"
                      }
                      className={
                        newTransaction.type === "expense"
                          ? "bg-budget-red hover:bg-budget-red/90"
                          : ""
                      }
                      onClick={() =>
                        setNewTransaction({ ...newTransaction, type: "expense" })
                      }
                    >
                      Expense
                    </Button>
                    <Button
                      variant={
                        newTransaction.type === "income" ? "default" : "outline"
                      }
                      className={
                        newTransaction.type === "income"
                          ? "bg-budget-green hover:bg-budget-green/90"
                          : ""
                      }
                      onClick={() =>
                        setNewTransaction({ ...newTransaction, type: "income" })
                      }
                    >
                      Income
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-8 input-focus-ring"
                        min="0"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What was this for?"
                      className="input-focus-ring"
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                      value={newTransaction.category}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a category</option>
                      {categories
                        .filter((c) =>
                          newTransaction.type === "income"
                            ? !c.budget
                            : c.budget
                        )
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddTransaction}
                  >
                    Add Transaction
                  </Button>
                </div>
              </CardContent>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Transactions</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Your latest financial activity
                </CardDescription>
                <div className="pt-2">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-focus-ring"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No transactions found
                    </div>
                  ) : (
                    filteredTransactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-budget-green-light"
                                : "bg-budget-red-light"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight
                                className="w-5 h-5 text-budget-green"
                              />
                            ) : (
                              <ArrowDownRight
                                className="w-5 h-5 text-budget-red"
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(transaction.date),
                                "MMM d, yyyy"
                              )}{" "}
                              • {getCategoryName(transaction.category)}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-medium ${
                            transaction.type === "income"
                              ? "text-budget-green"
                              : "text-budget-red"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))
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

export default Dashboard;
