
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Transaction, Category } from "@/utils/mockData";
import { toast } from "sonner";
import { calculateSummary } from "@/utils/dashboardUtils";
import FinancialSummaryCards from "@/components/dashboard/FinancialSummaryCards";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import TransactionForm from "@/components/dashboard/TransactionForm";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { supabase } from "@/integrations/supabase/client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ActivityTypes, logActivity } from "@/services/activityService";

const Dashboard = () => {
  const { isAuthenticated, user, userProfile, updateUserIncome } = useAuth();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useLocalStorage<Category[]>(
    `budgetify-categories-${user?.id || "demo"}`,
    []
  );
  const [budget] = useLocalStorage<any>(
    `budgetify-budget-${user?.id || "demo"}`,
    { id: "", amount: 0, period: "monthly", startDate: "", categories: [] }
  );
  
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense" as "income" | "expense",
  });
  
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(userProfile?.totalIncome?.toString() || "");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch transactions when user logs in
  useEffect(() => {
    console.log("Dashboard: Auth state:", isAuthenticated, user?.id);
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      fetchTransactions();
    }
  }, [isAuthenticated, user, navigate]);
  
  // Update newIncome when userProfile changes
  useEffect(() => {
    console.log("Dashboard: User profile updated:", userProfile);
    if (userProfile?.totalIncome) {
      setNewIncome(userProfile.totalIncome.toString());
    }
  }, [userProfile]);
  
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching transactions for user:", user.id);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Transactions fetched:", data);
      
      // Transform the data to match our Transaction type
      const formattedTransactions: Transaction[] = data.map((item: any) => ({
        id: item.id,
        amount: Number(item.amount),
        description: item.description,
        category: item.category,
        type: item.type as 'income' | 'expense',
        date: item.date,
      }));
      
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate summary based on transactions and user income
  const summary = calculateSummary(transactions, userProfile?.totalIncome || 0);
  
  const handleUpdateIncome = async () => {
    const income = parseInt(newIncome);
    if (isNaN(income) || income < 0) {
      toast.error("Please enter a valid income amount");
      return;
    }
    
    try {
      await updateUserIncome(income);
      
      // Activity logging is now handled in the updateUserIncome function
      
      toast.success("Income updated successfully");
      setIncomeDialogOpen(false);
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income");
    }
  };
  
  const handleAddTransaction = async () => {
    if (!user) return;
    
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      console.log("Adding transaction:", newTransaction);
      const transactionData = {
        user_id: user.id,
        amount: amount,
        description: newTransaction.description,
        category: newTransaction.category,
        type: newTransaction.type,
        date: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log("Transaction added:", data);
      
      // Add the new transaction to the state
      const newTrans: Transaction = {
        id: data[0].id,
        amount,
        description: newTransaction.description,
        category: newTransaction.category,
        type: newTransaction.type,
        date: data[0].date,
      };
      
      setTransactions([newTrans, ...transactions]);
      
      setNewTransaction({
        amount: "",
        description: "",
        category: "",
        type: "expense",
      });
      
      toast.success("Transaction added successfully");
      
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction: " + error.message);
    }
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
          Welcome back, {userProfile?.name || user?.email || "User"}
        </h1>
        
        <FinancialSummaryCards
          balance={summary.balance}
          userIncome={userProfile?.totalIncome}
          expenses={summary.expenses}
          incomeDialogOpen={incomeDialogOpen}
          setIncomeDialogOpen={setIncomeDialogOpen}
          newIncome={newIncome}
          setNewIncome={setNewIncome}
          handleUpdateIncome={handleUpdateIncome}
          hasTransactions={transactions.length > 0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts
              transactions={transactions}
              categories={categories}
              budget={budget}
              userIncome={userProfile?.totalIncome}
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
