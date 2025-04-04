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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const { isAuthenticated, user, userProfile, updateUserIncome, resetUserData, updateUserPhoneNumber } = useAuth();
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
  
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(userProfile?.total_income?.toString() || "");
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  useEffect(() => {
    console.log("Dashboard: Auth state:", isAuthenticated, user?.id);
    
    if (user) {
      fetchTransactions();
    }
  }, [user]);
  
  useEffect(() => {
    console.log("Dashboard: User profile updated:", userProfile);
    if (userProfile?.total_income) {
      setNewIncome(userProfile.total_income.toString());
    }
    if (userProfile?.phone_number) {
      setPhoneNumber(userProfile.phone_number);
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
  
  const handleUpdateIncome = async () => {
    const income = parseInt(newIncome);
    if (isNaN(income) || income < 0) {
      toast.error("Please enter a valid income amount");
      return;
    }
    
    try {
      console.log("Updating income to:", income);
      await updateUserIncome(income);
      toast.success("Income updated successfully");
      setIncomeDialogOpen(false);
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income");
    }
  };
  
  const handleUpdatePhoneNumber = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    try {
      await updateUserPhoneNumber(phoneNumber);
      setPhoneDialogOpen(false);
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("Failed to update phone number");
    }
  };
  
  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await resetUserData();
      setTransactions([]);
      toast.success("All data has been reset successfully");
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions([newTransaction, ...transactions]);
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

  if (isLoading && !userProfile) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 flex justify-center items-center h-[80vh]">
          <div className="animate-pulse text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading your dashboard...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your financial data</p>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = calculateSummary(transactions, userProfile?.total_income || 0);
  console.log("Dashboard rendering with summary:", summary, "and userProfile:", userProfile);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto text-left relative overflow-hidden px-4 md:px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"></div>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 dark:to-transparent"></div>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-100 to-transparent opacity-50 blur-3xl dark:from-purple-900/30"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-100 to-transparent opacity-50 blur-3xl dark:from-teal-900/30"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green">
              Welcome back, {userProfile?.name || user?.email || "User"}
            </h1>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Set Phone for 2FA</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Phone Number</DialogTitle>
                    <DialogDescription>
                      Add your phone number for two-factor authentication
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpdatePhoneNumber}
                      className="bg-budget-blue hover:bg-budget-blue/90"
                    >
                      Save Phone Number
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto" disabled={isResetting}>
                    <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Reset Data</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Financial Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all your transactions and reset your financial data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData}>
                      Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <FinancialSummaryCards
            balance={summary.balance}
            userIncome={userProfile?.total_income}
            expenses={summary.expenses}
            incomeDialogOpen={incomeDialogOpen}
            setIncomeDialogOpen={setIncomeDialogOpen}
            newIncome={newIncome}
            setNewIncome={setNewIncome}
            handleUpdateIncome={handleUpdateIncome}
            hasTransactions={transactions.length > 0}
            transactions={transactions}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DashboardCharts
                transactions={transactions}
                categories={categories}
                budget={budget}
                userIncome={userProfile?.total_income}
                COLORS={COLORS}
              />
            </div>
            
            <div className="space-y-8">
              <TransactionForm 
                userId={user?.id}
                onAddTransaction={handleAddTransaction}
              />
              
              <RecentTransactions
                transactions={transactions}
                categories={categories}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
