
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
import { ArrowUpRight, ArrowDownRight, Wallet, CircleDollarSign, PiggyBank, CreditCard, Settings, Plus, Filter, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const calculateSummary = (transactions: Transaction[], userIncome: number = 0) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = userIncome - expenses;
  const savingsRate = userIncome > 0 ? ((userIncome - expenses) / userIncome) * 100 : 0;
  
  return {
    income: userIncome,
    expenses,
    balance,
    savingsRate,
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Dashboard = () => {
  const { isAuthenticated, user, updateUserIncome } = useAuth();
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
  
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense",
  });
  
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(user?.totalIncome?.toString() || "");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  const summary = calculateSummary(transactions, user?.totalIncome || 0);
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? `text-${category.color}` : "text-gray-500";
  };
  
  const handleUpdateIncome = () => {
    const income = parseInt(newIncome);
    if (isNaN(income) || income < 0) {
      toast.error("Please enter a valid income amount");
      return;
    }
    updateUserIncome(income);
    setIncomeDialogOpen(false);
  };
  
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
    if (!user?.totalIncome || expenseByCategory.length > 0) return expenseByCategory;
    
    // Only generate estimates if there are no actual expenses
    return categories
      .filter(cat => cat.budget)
      .map(category => {
        // Using category's budget percentage to calculate from total income
        const estimatedBudget = (category.budget || 0) / 3000 * (user.totalIncome / 12);
        return {
          name: category.name,
          value: 0, // No actual value, just for chart rendering
          budget: Math.round(estimatedBudget)
        };
      });
  };
  
  const chartData = expenseByCategory.length > 0 ? expenseByCategory : generateBudgetEstimates();
  
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
  
  // Generate daily spending data
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
        const estimatedBudget = user?.totalIncome 
          ? ((category.budget || 0) / 3000) * (user.totalIncome / 12)
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
    <Layout>
      <div className="max-w-7xl mx-auto text-left">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.name || "User"}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Current Balance
            </h3>
            <p className="text-3xl font-bold mb-1">
              {user?.totalIncome ? formatCurrency(summary.balance) : "₹0"}
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
            <div className="absolute top-2 right-2 flex gap-2">
              <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-9 w-9 bg-budget-blue-light text-budget-blue rounded-full p-2">
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Monthly Income</DialogTitle>
                    <DialogDescription>
                      Enter your new monthly income amount.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-2">
                      <Label htmlFor="income">Monthly Income (₹)</Label>
                      <Input
                        id="income"
                        type="number"
                        value={newIncome}
                        onChange={(e) => setNewIncome(e.target.value)}
                        placeholder="Enter your monthly income"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpdateIncome}
                      className="bg-budget-blue hover:bg-budget-blue/90"
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="bg-budget-blue-light text-budget-blue rounded-full p-2">
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold mb-1">
              {user?.totalIncome ? formatCurrency(user.totalIncome) : "₹0"}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowUpRight className="w-4 h-4 text-budget-green mr-1" />
              <span>Monthly Income</span>
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
              {formatCurrency(summary.expenses || 0)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowDownRight className="w-4 h-4 text-budget-red mr-1" />
              <span>This month</span>
            </div>
          </GlassmorphicCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          </div>
          
          <div className="space-y-8">
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>
                  Record your expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="default"
                      className="bg-budget-red hover:bg-budget-red/90"
                    >
                      Expense
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        className="pl-8 input-focus-ring"
                        min="0"
                        step="1"
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
                        .filter((c) => c.budget)
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
            
            {/* Recent Transactions */}
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No transactions yet. Add your first one!
                    </p>
                  ) : (
                    transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === "expense" 
                              ? "bg-budget-red-light text-budget-red" 
                              : "bg-budget-green-light text-budget-green"
                          }`}>
                            {transaction.type === "expense" ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryName(transaction.category)} • {format(new Date(transaction.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <p className={`font-medium tabular-nums ${
                          transaction.type === "expense" ? "text-budget-red" : "text-budget-green"
                        }`}>
                          {transaction.type === "expense" ? "-" : "+"}
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
