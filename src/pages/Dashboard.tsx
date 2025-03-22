
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Transaction, Category, Budget } from "@/utils/mockData";
import { toast } from "sonner";
import { calculateSummary } from "@/utils/dashboardUtils";
import FinancialSummaryCards from "@/components/dashboard/FinancialSummaryCards";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import TransactionForm from "@/components/dashboard/TransactionForm";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto text-left">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.name || "User"}
        </h1>
        
        <FinancialSummaryCards
          balance={summary.balance}
          userIncome={user?.totalIncome}
          expenses={summary.expenses}
          incomeDialogOpen={incomeDialogOpen}
          setIncomeDialogOpen={setIncomeDialogOpen}
          newIncome={newIncome}
          setNewIncome={setNewIncome}
          handleUpdateIncome={handleUpdateIncome}
          hasTransactions={transactions.length > 0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts
              transactions={transactions}
              categories={categories}
              budget={budget}
              userIncome={user?.totalIncome}
              COLORS={COLORS}
            />
          </div>
          
          <div className="space-y-8">
            <TransactionForm
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              categories={categories}
              handleAddTransaction={handleAddTransaction}
            />
            
            <RecentTransactions
              transactions={transactions}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
