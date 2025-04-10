
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import {
  SplitExpense,
  createSplitExpense,
  fetchUserSplitExpenses,
  updateExpenseShareStatus,
  deleteSplitExpense
} from "@/services/splitExpenseService";
import { ActivityTypes, logActivity } from "@/services/activityService";
import {
  CompanionGroup,
  fetchCompanionGroups
} from "@/services/companionService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatting";
import { 
  Split, 
  Plus, 
  Users, 
  UserPlus, 
  ReceiptText, 
  Check, 
  X, 
  Trash2, 
  Calendar, 
  DollarSign,
  Loader
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const expenseCategories = [
  "Food & Dining",
  "Entertainment",
  "Transportation",
  "Utilities",
  "Rent/Mortgage",
  "Shopping",
  "Travel",
  "Health",
  "Education",
  "Personal",
  "Other"
];

const SplitExpensesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState<SplitExpense[]>([]);
  const [groups, setGroups] = useState<CompanionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [shares, setShares] = useState<{userId: string; amount: number}[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [activeTab, setActiveTab] = useState<'owed' | 'paid'>('owed');
  
  // Form schema for new expense
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.string().min(1, "Date is required"),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      loadData();
    }
  }, [isAuthenticated, user, navigate]);
  
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [fetchedExpenses, fetchedGroups] = await Promise.all([
        fetchUserSplitExpenses(user.id),
        fetchCompanionGroups(user.id)
      ]);
      
      setExpenses(fetchedExpenses);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load expenses and groups");
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateShares = (totalAmount: number, members: string[]) => {
    if (splitType === 'equal' && members.length > 0) {
      const equalShare = totalAmount / members.length;
      return members.map(userId => ({
        userId,
        amount: parseFloat(equalShare.toFixed(2))
      }));
    }
    return shares;
  };
  
  const handleCreateExpense = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      // Determine which members to split with based on selection
      let membersToSplit: string[] = [user.id]; // Always include current user
      
      if (selectedGroup) {
        // Get members from selected group
        const group = groups.find(g => g.id === selectedGroup);
        if (group) {
          const activeMembers = group.members
            .filter(m => m.status === 'active')
            .map(m => m.id);
          
          membersToSplit = [...new Set([...membersToSplit, ...activeMembers])];
        }
      } else if (shares.length > 0) {
        // Use manually added shares
        membersToSplit = [...new Set([...membersToSplit, ...shares.map(s => s.userId)])];
      }
      
      // Calculate shares based on split type
      const calculatedShares = calculateShares(values.amount, membersToSplit);
      
      // Create the expense
      const expense = await createSplitExpense(
        user.id,
        values.title,
        values.description || null,
        values.category,
        values.amount,
        values.date,
        calculatedShares
      );
      
      if (expense) {
        setExpenses(prev => [expense, ...prev]);
        form.reset();
        setSelectedGroup(null);
        setShares([]);
        setIsDialogOpen(false);
        logActivity(user.id, ActivityTypes.TRANSACTION, `Created split expense: ${values.title}`);
        toast.success("Expense split successfully");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to create split expense");
    }
  };
  
  const handlePayExpense = async (shareId: string) => {
    if (!user) return;
    
    try {
      const success = await updateExpenseShareStatus(shareId, 'paid', user.id);
      
      if (success) {
        // Update local state
        setExpenses(prev => 
          prev.map(expense => ({
            ...expense,
            shares: expense.shares.map(share => 
              share.id === shareId 
                ? { ...share, status: 'paid' } 
                : share
            )
          }))
        );
        
        logActivity(user.id, ActivityTypes.TRANSACTION, "Marked expense as paid");
        toast.success("Expense marked as paid");
      }
    } catch (error) {
      console.error("Error paying expense:", error);
      toast.error("Failed to update expense status");
    }
  };
  
  const handleDeclineExpense = async (shareId: string) => {
    if (!user) return;
    
    try {
      const success = await updateExpenseShareStatus(shareId, 'declined', user.id);
      
      if (success) {
        // Update local state
        setExpenses(prev => 
          prev.map(expense => ({
            ...expense,
            shares: expense.shares.map(share => 
              share.id === shareId 
                ? { ...share, status: 'declined' } 
                : share
            )
          }))
        );
        
        logActivity(user.id, ActivityTypes.TRANSACTION, "Declined expense");
        toast.success("Expense declined");
      }
    } catch (error) {
      console.error("Error declining expense:", error);
      toast.error("Failed to update expense status");
    }
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    try {
      const success = await deleteSplitExpense(expenseId, user.id);
      
      if (success) {
        // Remove from local state
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
        logActivity(user.id, ActivityTypes.TRANSACTION, "Deleted split expense");
        toast.success("Expense deleted");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };
  
  // Filter expenses based on active tab
  const filteredExpenses = expenses.filter(expense => {
    if (!user) return false;
    
    if (activeTab === 'owed') {
      // Show expenses where user owes money (not paid or declined)
      return expense.shares.some(share => 
        share.user_id === user.id && 
        share.status === 'pending' &&
        expense.creator_id !== user.id
      );
    } else { // 'paid' tab
      // Show expenses created by user and those paid by user
      return expense.creator_id === user.id || 
        expense.shares.some(share => 
          share.user_id === user.id && 
          share.status === 'paid'
        );
    }
  });
  
  // Calculate total owed to user and total user owes others
  const { totalOwed, totalOwes } = expenses.reduce((acc, expense) => {
    if (!user) return acc;
    
    if (expense.creator_id === user.id) {
      // Money owed to user by others
      expense.shares.forEach(share => {
        if (share.user_id !== user.id && share.status === 'pending') {
          acc.totalOwed += share.amount;
        }
      });
    } else {
      // Money user owes to others
      expense.shares.forEach(share => {
        if (share.user_id === user.id && share.status === 'pending') {
          acc.totalOwes += share.amount;
        }
      });
    }
    
    return acc;
  }, { totalOwed: 0, totalOwes: 0 });
  
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Split className="h-4 w-4" />
                <span>Split New Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Split a New Expense</DialogTitle>
                <DialogDescription>
                  Create a new expense to split with friends or groups.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateExpense)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expense Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Dinner at Restaurant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add details about this expense" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="pl-10" 
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Recalculate shares if using equal split
                                if (splitType === 'equal') {
                                  const amount = parseFloat(e.target.value) || 0;
                                  const members = selectedGroup 
                                    ? groups.find(g => g.id === selectedGroup)?.members
                                      .filter(m => m.status === 'active')
                                      .map(m => m.id) || []
                                    : shares.map(s => s.userId);
                                    
                                  if (user) {
                                    const allMembers = [...new Set([user.id, ...members])];
                                    setShares(calculateShares(amount, allMembers));
                                  }
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Split With</Label>
                      <Select 
                        onValueChange={(value) => {
                          setSelectedGroup(value);
                          
                          // Reset shares if a group is selected
                          if (value) {
                            const group = groups.find(g => g.id === value);
                            if (group && user) {
                              const activeMembers = [
                                user.id,
                                ...group.members
                                  .filter(m => m.status === 'active')
                                  .map(m => m.id)
                              ];
                              
                              // Calculate shares based on current amount
                              const amount = form.getValues("amount") || 0;
                              setShares(calculateShares(amount, activeMembers));
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group or individual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual People</SelectItem>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.members.filter(m => m.status === 'active').length} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Split Type</Label>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          type="button"
                          variant={splitType === 'equal' ? 'default' : 'outline'}
                          onClick={() => setSplitType('equal')}
                          className="flex-1"
                        >
                          Equal Split
                        </Button>
                        <Button
                          type="button"
                          variant={splitType === 'custom' ? 'default' : 'outline'}
                          onClick={() => setSplitType('custom')}
                          className="flex-1"
                        >
                          Custom Amounts
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show shares/members based on selection */}
                    <div className="border rounded-md p-3 bg-muted/20 max-h-[200px] overflow-y-auto">
                      <h4 className="font-medium mb-2">Expense Shares</h4>
                      
                      {selectedGroup ? (
                        // Show group members
                        <div className="space-y-2">
                          {groups.find(g => g.id === selectedGroup)?.members
                            .filter(m => m.status === 'active')
                            .map(member => (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span>{member.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {splitType === 'custom' ? (
                                    <Input
                                      type="number"
                                      className="w-20 h-8"
                                      value={shares.find(s => s.userId === member.id)?.amount || 0}
                                      onChange={(e) => {
                                        const amount = parseFloat(e.target.value) || 0;
                                        setShares(prev => {
                                          const newShares = [...prev];
                                          const index = newShares.findIndex(s => s.userId === member.id);
                                          if (index >= 0) {
                                            newShares[index].amount = amount;
                                          } else {
                                            newShares.push({ userId: member.id, amount });
                                          }
                                          return newShares;
                                        });
                                      }}
                                    />
                                  ) : (
                                    <span>
                                      {formatCurrency(shares.find(s => s.userId === member.id)?.amount || 0)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                          {/* Always show current user */}
                          {user && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <span>You (Creator)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {splitType === 'custom' ? (
                                  <Input
                                    type="number"
                                    className="w-20 h-8"
                                    value={shares.find(s => s.userId === user.id)?.amount || 0}
                                    onChange={(e) => {
                                      const amount = parseFloat(e.target.value) || 0;
                                      setShares(prev => {
                                        const newShares = [...prev];
                                        const index = newShares.findIndex(s => s.userId === user.id);
                                        if (index >= 0) {
                                          newShares[index].amount = amount;
                                        } else {
                                          newShares.push({ userId: user.id, amount });
                                        }
                                        return newShares;
                                      });
                                    }}
                                  />
                                ) : (
                                  <span>
                                    {formatCurrency(shares.find(s => s.userId === user.id)?.amount || 0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Just show current user for individual selection
                        <div className="space-y-2">
                          {user && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <span>You (Creator)</span>
                              </div>
                              <span>{formatCurrency(form.getValues("amount") || 0)}</span>
                            </div>
                          )}
                          {/* TODO: Add UI to invite individuals */}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Create Split Expense</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-green-800 dark:text-green-400">Total Owed to You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalOwed)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                From {expenses.filter(e => e.creator_id === user?.id).length} expenses you created
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-orange-800 dark:text-orange-400">Total You Owe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(totalOwes)}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                From {expenses.filter(e => e.creator_id !== user?.id && e.shares.some(s => s.user_id === user?.id && s.status === 'pending')).length} expenses shared with you
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for expenses */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'owed' | 'paid')}>
          <TabsList className="mb-4">
            <TabsTrigger value="owed" className="relative">
              Expenses You Owe
              {totalOwes > 0 && (
                <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2">
                  {expenses.filter(e => 
                    e.creator_id !== user?.id && 
                    e.shares.some(s => s.user_id === user?.id && s.status === 'pending')
                  ).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paid">
              Your Expenses & Paid
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="owed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/10">
                <Split className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Expenses to Pay</h3>
                <p className="text-muted-foreground mt-2">You don't have any pending expenses to pay right now.</p>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <Card key={expense.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium">{expense.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            <span className="mx-1">•</span>
                            <Badge variant="outline">{expense.category}</Badge>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(
                          expense.shares.find(s => s.user_id === user?.id)?.amount || 0
                        )}</p>
                        <p className="text-xs text-muted-foreground">
                          Your share of {formatCurrency(expense.total_amount)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {expense.description && (
                      <p className="text-sm mb-3">{expense.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {expense.shares.find(s => s.user_id === expense.creator_id)?.user_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {expense.shares.find(s => s.user_id === expense.creator_id)?.user_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">Created this expense</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        const share = expense.shares.find(s => s.user_id === user?.id);
                        if (share) handleDeclineExpense(share.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span>Decline</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        const share = expense.shares.find(s => s.user_id === user?.id);
                        if (share) handlePayExpense(share.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <span>Pay</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/10">
                <ReceiptText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Expenses Yet</h3>
                <p className="text-muted-foreground mt-2">You haven't created any expenses or paid any shares yet.</p>
                <Button className="mt-4 gap-2" onClick={() => setIsDialogOpen(true)}>
                  <Split className="h-4 w-4" />
                  <span>Create Your First Split</span>
                </Button>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <Card key={expense.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {expense.title}
                          {expense.creator_id === user?.id && (
                            <Badge variant="secondary" className="ml-2">You Created</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            <span className="mx-1">•</span>
                            <Badge variant="outline">{expense.category}</Badge>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(expense.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.shares.length} shares
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {expense.description && (
                      <p className="text-sm mb-3">{expense.description}</p>
                    )}
                    
                    <h4 className="text-sm font-medium mb-2">Expense Shares</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {expense.shares.map(share => (
                        <div key={share.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{share.user_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className={share.user_id === user?.id ? "font-medium" : ""}>
                              {share.user_id === user?.id ? "You" : share.user_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{formatCurrency(share.amount)}</span>
                            <Badge 
                              variant={
                                share.status === 'paid' ? 'success' :
                                share.status === 'declined' ? 'destructive' : 'outline'
                              }
                              className="text-xs capitalize"
                            >
                              {share.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  {expense.creator_id === user?.id && (
                    <CardFooter className="justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Split Expense?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this expense and all its shares.
                              This action cannot be undone.
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
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SplitExpensesPage;
