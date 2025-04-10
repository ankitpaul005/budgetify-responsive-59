
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatting";
import { Plus, UserPlus, Users, User, Receipt, CreditCard, Check, X, MoreHorizontal, ArrowRight, Divide } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SplitExpenseStatus = "pending" | "declined" | "paid";

interface SplitExpenseShare {
  id: string;
  split_expense_id: string;
  user_id: string;
  amount: number;
  status: SplitExpenseStatus;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface SplitExpense {
  id: string;
  title: string;
  description: string | null;
  category: string;
  total_amount: number;
  date: string;
  currency: string;
  creator_id: string;
  created_at: string;
  shares: SplitExpenseShare[];
}

const expenseCategories = [
  "Food", "Groceries", "Transportation", "Entertainment", "Utilities", 
  "Housing", "Travel", "Health", "Education", "Shopping", "Other"
];

const SplitExpenses = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("my-expenses");
  const [expenses, setExpenses] = useState<SplitExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New expense form state
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<string>("Food");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState("USD");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Sharing state
  const [shareWithEmail, setShareWithEmail] = useState("");
  const [sharingList, setSharingList] = useState<{email: string, amount: string}[]>([]);
  const [sharingMethod, setSharingMethod] = useState<"equal" | "custom">("equal");
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchExpenses();
    }
  }, [isAuthenticated, user]);
  
  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get expenses created by the user
      const { data: createdExpenses, error: createdExpensesError } = await supabase
        .from('split_expenses')
        .select('*')
        .eq('creator_id', user.id);
      
      if (createdExpensesError) throw createdExpensesError;
      
      // Get expenses shared with the user
      const { data: sharedExpensesData, error: sharedExpensesError } = await supabase
        .from('split_expense_shares')
        .select('split_expense_id')
        .eq('user_id', user.id);
      
      if (sharedExpensesError) throw sharedExpensesError;
      
      const sharedExpenseIds = sharedExpensesData.map(item => item.split_expense_id);
      
      let allExpenseIds: string[] = [];
      if (createdExpenses) {
        allExpenseIds = [...createdExpenses.map(expense => expense.id)];
      }
      
      if (sharedExpenseIds.length > 0) {
        allExpenseIds = [...new Set([...allExpenseIds, ...sharedExpenseIds])];
      }
      
      const allExpenses: SplitExpense[] = [];
      
      for (const expenseId of allExpenseIds) {
        const { data: expense, error: expenseError } = await supabase
          .from('split_expenses')
          .select('*')
          .eq('id', expenseId)
          .single();
        
        if (expenseError) {
          console.error(`Error fetching expense ${expenseId}:`, expenseError);
          continue;
        }
        
        const { data: shares, error: sharesError } = await supabase
          .from('split_expense_shares')
          .select('*')
          .eq('split_expense_id', expenseId);
        
        if (sharesError) {
          console.error(`Error fetching shares for expense ${expenseId}:`, sharesError);
          continue;
        }
        
        // Fetch user details for shares
        const enhancedShares = await Promise.all(shares.map(async (share) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', share.user_id)
            .single();
          
          if (userError) {
            console.error(`Error fetching user ${share.user_id}:`, userError);
            return share;
          }
          
          return {
            ...share,
            user_name: userData.name,
            user_email: userData.email
          };
        }));
        
        allExpenses.push({
          ...expense,
          shares: enhancedShares
        });
      }
      
      setExpenses(allExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPerson = () => {
    if (!shareWithEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (shareWithEmail === user?.email) {
      toast.error("You can't add yourself to the split");
      return;
    }
    
    if (sharingList.some(item => item.email === shareWithEmail)) {
      toast.error("This person is already added");
      return;
    }
    
    // For equal split, calculate amount per person
    let amount = "";
    if (sharingMethod === "equal") {
      const numPeople = sharingList.length + 2; // +1 for the new person and +1 for the current user
      const totalAmount = parseFloat(expenseAmount || "0");
      if (!isNaN(totalAmount) && totalAmount > 0) {
        amount = (totalAmount / numPeople).toFixed(2);
        
        // Update existing shares with new equal amounts
        setSharingList(prevList => 
          prevList.map(item => ({
            ...item,
            amount
          }))
        );
      }
    }
    
    setSharingList([...sharingList, { email: shareWithEmail, amount }]);
    setShareWithEmail("");
  };
  
  const handleRemovePerson = (email: string) => {
    const newList = sharingList.filter(item => item.email !== email);
    setSharingList(newList);
    
    // Recalculate equal split if needed
    if (sharingMethod === "equal" && newList.length > 0) {
      const numPeople = newList.length + 1; // +1 for the current user
      const totalAmount = parseFloat(expenseAmount || "0");
      if (!isNaN(totalAmount) && totalAmount > 0) {
        const newAmount = (totalAmount / numPeople).toFixed(2);
        setSharingList(newList.map(item => ({
          ...item,
          amount: newAmount
        })));
      }
    }
  };
  
  const updateSharingAmounts = () => {
    if (sharingMethod === "equal" && sharingList.length > 0) {
      const numPeople = sharingList.length + 1; // +1 for the current user
      const totalAmount = parseFloat(expenseAmount || "0");
      if (!isNaN(totalAmount) && totalAmount > 0) {
        const newAmount = (totalAmount / numPeople).toFixed(2);
        setSharingList(sharingList.map(item => ({
          ...item,
          amount: newAmount
        })));
      }
    }
  };
  
  const handleShareAmountChange = (email: string, amount: string) => {
    setSharingList(sharingList.map(item => 
      item.email === email ? { ...item, amount } : item
    ));
  };
  
  const handleCreateExpense = async () => {
    if (!user) return;
    
    if (!expenseTitle.trim()) {
      toast.error("Please enter an expense title");
      return;
    }
    
    const totalAmount = parseFloat(expenseAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (sharingList.length === 0) {
      toast.error("Please add at least one person to split with");
      return;
    }
    
    // Validate custom split amounts
    if (sharingMethod === "custom") {
      const missingAmount = sharingList.some(item => !item.amount.trim());
      if (missingAmount) {
        toast.error("Please enter an amount for each person");
        return;
      }
      
      const sharesTotal = sharingList.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
      const userAmount = totalAmount - sharesTotal;
      
      if (userAmount < 0) {
        toast.error("The total shares exceed the expense amount");
        return;
      }
    }
    
    try {
      // 1. Create the expense
      const { data: newExpense, error: expenseError } = await supabase
        .from('split_expenses')
        .insert({
          title: expenseTitle,
          description: expenseDescription || null,
          category: expenseCategory,
          total_amount: totalAmount,
          date: expenseDate,
          currency: expenseCurrency,
          creator_id: user.id
        })
        .select()
        .single();
      
      if (expenseError) throw expenseError;
      
      // 2. Calculate shares
      const shares = [];
      let remainingAmount = totalAmount;
      
      // Add shares for others
      for (const share of sharingList) {
        let shareAmount: number;
        
        if (sharingMethod === "equal") {
          shareAmount = totalAmount / (sharingList.length + 1); // +1 for the current user
        } else {
          shareAmount = parseFloat(share.amount || "0");
        }
        
        remainingAmount -= shareAmount;
        
        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', share.email)
          .maybeSingle();
        
        if (userError) throw userError;
        
        if (!userData) {
          // Handle case where user doesn't exist
          // For now, we'll just log it and continue
          console.warn(`User with email ${share.email} not found`);
          continue;
        }
        
        shares.push({
          split_expense_id: newExpense.id,
          user_id: userData.id,
          amount: shareAmount,
          status: "pending"
        });
      }
      
      // 3. Insert shares
      if (shares.length > 0) {
        const { error: sharesError } = await supabase
          .from('split_expense_shares')
          .insert(shares);
        
        if (sharesError) throw sharesError;
      }
      
      toast.success("Expense created and shared successfully");
      setIsNewExpenseDialogOpen(false);
      resetExpenseForm();
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to create expense");
    }
  };
  
  const handlePayExpense = async (expenseId: string, shareId: string) => {
    try {
      const { error } = await supabase
        .from('split_expense_shares')
        .update({ status: "paid" })
        .eq('id', shareId);
      
      if (error) throw error;
      
      toast.success("Expense marked as paid");
      fetchExpenses();
    } catch (error) {
      console.error("Error paying expense:", error);
      toast.error("Failed to update expense status");
    }
  };
  
  const handleDeclineExpense = async (expenseId: string, shareId: string) => {
    try {
      const { error } = await supabase
        .from('split_expense_shares')
        .update({ status: "declined" })
        .eq('id', shareId);
      
      if (error) throw error;
      
      toast.success("Expense declined");
      fetchExpenses();
    } catch (error) {
      console.error("Error declining expense:", error);
      toast.error("Failed to update expense status");
    }
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      // First delete shares
      const { error: sharesError } = await supabase
        .from('split_expense_shares')
        .delete()
        .eq('split_expense_id', expenseId);
      
      if (sharesError) throw sharesError;
      
      // Then delete the expense
      const { error: expenseError } = await supabase
        .from('split_expenses')
        .delete()
        .eq('id', expenseId);
      
      if (expenseError) throw expenseError;
      
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };
  
  const resetExpenseForm = () => {
    setExpenseTitle("");
    setExpenseDescription("");
    setExpenseCategory("Food");
    setExpenseAmount("");
    setExpenseCurrency("USD");
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setShareWithEmail("");
    setSharingList([]);
    setSharingMethod("equal");
  };
  
  const getStatusBadge = (status: SplitExpenseStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "paid":
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case "declined":
        return <Badge className="bg-red-500 text-white">Declined</Badge>;
      default:
        return null;
    }
  };
  
  const getUserShare = (expense: SplitExpense) => {
    if (!user) return null;
    
    if (expense.creator_id === user.id) {
      // Calculate creator share
      const othersTotal = expense.shares.reduce((sum, share) => sum + share.amount, 0);
      return {
        amount: expense.total_amount - othersTotal,
        isCreator: true,
        status: "paid" as SplitExpenseStatus
      };
    } else {
      // Find user's share
      const userShare = expense.shares.find(share => share.user_id === user.id);
      if (userShare) {
        return {
          amount: userShare.amount,
          isCreator: false,
          shareId: userShare.id,
          status: userShare.status
        };
      }
    }
    
    return null;
  };
  
  const filteredExpenses = (() => {
    switch (activeTab) {
      case "my-expenses":
        return expenses.filter(expense => expense.creator_id === user?.id);
      case "pending":
        return expenses.filter(expense => {
          const userShare = getUserShare(expense);
          return !expense.creator_id && userShare && userShare.status === "pending";
        });
      case "paid":
        return expenses.filter(expense => {
          const userShare = getUserShare(expense);
          return userShare && userShare.status === "paid" && !expense.creator_id;
        });
      default:
        return expenses;
    }
  })();
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to split expenses with friends</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Split Expenses
            </h1>
            <p className="text-muted-foreground">
              Split bills with friends and track who owes what
            </p>
          </div>
          
          <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Expense</DialogTitle>
                <DialogDescription>
                  Enter expense details and split it with friends.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="expense-title">Title</Label>
                    <Input 
                      id="expense-title" 
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)} 
                      placeholder="Dinner at Restaurant"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expense-category">Category</Label>
                    <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                      <SelectTrigger id="expense-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expense-date">Date</Label>
                    <Input 
                      id="expense-date" 
                      type="date" 
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expense-amount">Amount</Label>
                    <Input 
                      id="expense-amount" 
                      type="number" 
                      value={expenseAmount}
                      onChange={(e) => {
                        setExpenseAmount(e.target.value);
                        if (sharingMethod === "equal") {
                          setTimeout(updateSharingAmounts, 0);
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expense-currency">Currency</Label>
                    <Select value={expenseCurrency} onValueChange={setExpenseCurrency}>
                      <SelectTrigger id="expense-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="expense-description">Description (Optional)</Label>
                    <Input 
                      id="expense-description" 
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="Additional details about the expense"
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Split With</h3>
                    <Select value={sharingMethod} onValueChange={(value: "equal" | "custom") => setSharingMethod(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Splitting method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equal">Split Equally</SelectItem>
                        <SelectItem value="custom">Custom Amounts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter email" 
                      value={shareWithEmail}
                      onChange={(e) => setShareWithEmail(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddPerson}>Add</Button>
                  </div>
                  
                  {sharingList.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user?.email} (You)</p>
                            <p className="text-xs text-muted-foreground">Owner</p>
                          </div>
                        </div>
                        {sharingMethod === "custom" ? (
                          <p className="text-sm font-medium">
                            Remaining: {formatCurrency(
                              parseFloat(expenseAmount || "0") - 
                              sharingList.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0),
                              expenseCurrency
                            )}
                          </p>
                        ) : (
                          <p className="text-sm font-medium">
                            {expenseAmount && sharingList.length > 0 
                              ? formatCurrency(parseFloat(expenseAmount) / (sharingList.length + 1), expenseCurrency)
                              : "-"}
                          </p>
                        )}
                      </div>
                      
                      {sharingList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{item.email[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{item.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {sharingMethod === "custom" ? (
                              <Input
                                type="number"
                                className="w-24 h-8"
                                value={item.amount}
                                onChange={(e) => handleShareAmountChange(item.email, e.target.value)}
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="text-sm">
                                {expenseAmount 
                                  ? formatCurrency(parseFloat(expenseAmount) / (sharingList.length + 1), expenseCurrency)
                                  : "-"}
                              </span>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => handleRemovePerson(item.email)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense}>Create Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="my-expenses">My Expenses</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-expenses" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No Expenses Yet</h3>
                  <p className="text-muted-foreground text-center mt-2 mb-6">
                    Create an expense and share it with your friends
                  </p>
                  <Button onClick={() => setIsNewExpenseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map(expense => (
                  <Card key={expense.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{expense.title}</CardTitle>
                          <CardDescription>{expense.category} • {new Date(expense.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  Delete Expense
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this expense and remove it for all participants.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold">
                          {formatCurrency(expense.total_amount, expense.currency)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {expense.currency}
                        </Badge>
                      </div>
                      
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mb-3">{expense.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Split with:</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-2 pr-2">
                          {expense.shares.map(share => (
                            <div key={share.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>
                                    {share.user_name?.[0] || share.user_email?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{share.user_name || share.user_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{formatCurrency(share.amount, expense.currency)}</span>
                                {getStatusBadge(share.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Check className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No Pending Expenses</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any pending expenses to pay
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map(expense => {
                  const userShare = getUserShare(expense);
                  if (!userShare || userShare.isCreator) return null;
                  
                  return (
                    <Card key={expense.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{expense.title}</CardTitle>
                            <CardDescription>{expense.category} • {new Date(expense.date).toLocaleDateString()}</CardDescription>
                          </div>
                          <Badge variant="outline">{expense.currency}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-medium">Your share:</span>
                          <span className="text-2xl font-bold">{formatCurrency(userShare.amount, expense.currency)}</span>
                        </div>
                        
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mb-4">{expense.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-4">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            From {expense.shares.find(s => s.user_id === expense.creator_id)?.user_name || "Unknown"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDeclineExpense(expense.id, userShare.shareId!)}
                        >
                          Decline
                        </Button>
                        <Button 
                          variant="default"
                          className="flex-1"
                          onClick={() => handlePayExpense(expense.id, userShare.shareId!)}
                        >
                          Pay
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No Paid Expenses</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You haven't paid any expenses yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map(expense => {
                  const userShare = getUserShare(expense);
                  if (!userShare || userShare.isCreator) return null;
                  
                  return (
                    <Card key={expense.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{expense.title}</CardTitle>
                            <CardDescription>{expense.category} • {new Date(expense.date).toLocaleDateString()}</CardDescription>
                          </div>
                          <Badge variant="outline">{expense.currency}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-medium">Your share:</span>
                          <span className="text-2xl font-bold">{formatCurrency(userShare.amount, expense.currency)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            From {expense.shares.find(s => s.user_id === expense.creator_id)?.user_name || "Unknown"}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <Badge variant="success" className="bg-green-500 hover:bg-green-600 text-white">Paid</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SplitExpenses;
