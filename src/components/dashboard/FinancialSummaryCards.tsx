
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { Wallet, CircleDollarSign, CreditCard, InfoIcon, Edit, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatting";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction } from "@/utils/mockData";

interface FinancialSummaryCardsProps {
  balance: number;
  userIncome: number | undefined;
  expenses: number;
  incomeDialogOpen: boolean;
  setIncomeDialogOpen: (open: boolean) => void;
  newIncome: string;
  setNewIncome: (income: string) => void;
  handleUpdateIncome: () => void;
  hasTransactions: boolean;
  transactions?: Transaction[];
}

const COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6"];

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  balance,
  userIncome,
  expenses,
  incomeDialogOpen,
  setIncomeDialogOpen,
  newIncome,
  setNewIncome,
  handleUpdateIncome,
  hasTransactions,
  transactions = [],
}) => {
  // Group expenses by category for the pie chart
  const expensesByCategory = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Get all expense transactions
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Group by category and sum amounts
    const groupedExpenses = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for PieChart
    return Object.entries(groupedExpenses).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);
  }, [transactions]);

  const hasCategoryData = expensesByCategory.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-lg p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-800 dark:to-slate-900 border-t border-l border-white/20 dark:border-white/5">
        <div className="absolute top-3 right-3 bg-gradient-to-r from-budget-green-light to-teal-100 text-budget-green rounded-full p-2.5 shadow-md">
          <Wallet className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Current Balance
        </h3>
        {userIncome !== undefined ? (
          <p className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-budget-green to-teal-500">
            {formatCurrency(balance)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Update your income to see balance</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>This month</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950 border-t border-l border-white/20 dark:border-white/5">
        <div className="absolute top-3 right-3 flex gap-2">
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-10 w-10 bg-gradient-to-r from-budget-blue-light to-blue-100 text-budget-blue rounded-full p-2.5 shadow-md">
                <Edit className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
          <div className="bg-gradient-to-r from-budget-blue-light to-blue-100 text-budget-blue rounded-full p-2.5 shadow-md">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Total Income
        </h3>
        {userIncome !== undefined && userIncome > 0 ? (
          <p className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-blue-600">
            {formatCurrency(userIncome)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Click edit to update income</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Monthly Income</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-lg p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-red-950 border-t border-l border-white/20 dark:border-white/5">
        <div className="absolute top-3 right-3 bg-gradient-to-r from-budget-red-light to-red-100 text-budget-red rounded-full p-2.5 shadow-md">
          <CreditCard className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Total Expenses
        </h3>
        {expenses > 0 || hasTransactions ? (
          <p className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-budget-red to-red-600">
            {formatCurrency(expenses)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">No expenses tracked yet</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>This month</span>
        </div>
      </GlassmorphicCard>

      {/* Expenses Pie Chart */}
      <div className="md:col-span-3">
        <GlassmorphicCard className="overflow-hidden transition-all hover:shadow-lg p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-800 dark:to-purple-950 border-t border-l border-white/20 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Expense Breakdown
              </h3>
              <p className="text-sm text-muted-foreground">
                How your expenses are distributed
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-600 dark:text-purple-400 rounded-full p-2.5 shadow-md">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Spent"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <PieChartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-muted-foreground text-center">
                  No expense data available. Add transactions to see your expense breakdown.
                </p>
              </div>
            )}
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;
