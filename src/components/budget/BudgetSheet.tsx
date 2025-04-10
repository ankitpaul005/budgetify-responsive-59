
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatting";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  MoreHorizontal,
  Filter,
  Search,
  Loader,
  CheckCircle2
} from "lucide-react";
import VirtualKeyboard from "@/components/accessibility/VirtualKeyboard";
import TextToSpeech from "@/components/accessibility/TextToSpeech";

interface BudgetEntry {
  id: string;
  sheet_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

interface BudgetSheetProps {
  sheetId: string;
  entries: BudgetEntry[];
  onEntriesUpdated: (entries: BudgetEntry[]) => void;
}

const CATEGORIES = [
  { value: "Housing", label: "Housing" },
  { value: "Transportation", label: "Transportation" },
  { value: "Food", label: "Food" },
  { value: "Utilities", label: "Utilities" },
  { value: "Insurance", label: "Insurance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Clothing", label: "Clothing" },
  { value: "Education", label: "Education" },
  { value: "Savings", label: "Savings" },
  { value: "Debt", label: "Debt" },
  { value: "Salary", label: "Salary" },
  { value: "Investments", label: "Investments" },
  { value: "Gifts", label: "Gifts" },
  { value: "Other", label: "Other" },
];

const BudgetSheet: React.FC<BudgetSheetProps> = ({ 
  sheetId, 
  entries, 
  onEntriesUpdated 
}) => {
  const { user } = useAuth();
  
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleAddEntry = async () => {
    if (!user) {
      toast.error("You must be logged in to add entries");
      return;
    }
    
    if (!description || !amount || !category) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      setIsAddingEntry(true);
      
      const newEntry = {
        sheet_id: sheetId,
        user_id: user.id,
        type,
        category,
        amount: Number(amount),
        date: date.toISOString(),
        description
      };
      
      const { data, error } = await supabase
        .from('budget_entries')
        .insert(newEntry)
        .select()
        .single();
      
      if (error) throw error;
      
      onEntriesUpdated([data, ...entries]);
      
      setDescription("");
      setAmount("");
      setCategory("");
      setType('expense');
      setDate(new Date());
      
      toast.success("Entry added successfully");
    } catch (error) {
      console.error("Error adding budget entry:", error);
      toast.error("Failed to add entry");
    } finally {
      setIsAddingEntry(false);
    }
  };
  
  const handleUpdateEntry = async () => {
    if (!user || !editingEntry) return;
    
    try {
      const updatedEntry = {
        ...editingEntry,
        type: editingEntry.type,
        category: editingEntry.category,
        amount: Number(editingEntry.amount),
        date: new Date(editingEntry.date).toISOString(),
        description: editingEntry.description
      };
      
      const { error } = await supabase
        .from('budget_entries')
        .update(updatedEntry)
        .eq('id', editingEntry.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedEntries = entries.map(entry =>
        entry.id === editingEntry.id ? updatedEntry : entry
      );
      
      onEntriesUpdated(updatedEntries);
      setIsEditDialogOpen(false);
      
      toast.success("Entry updated successfully");
    } catch (error) {
      console.error("Error updating budget entry:", error);
      toast.error("Failed to update entry");
    }
  };
  
  const handleDeleteEntry = async () => {
    if (!user || !deleteEntryId) return;
    
    try {
      const { error } = await supabase
        .from('budget_entries')
        .delete()
        .eq('id', deleteEntryId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedEntries = entries.filter(entry => entry.id !== deleteEntryId);
      onEntriesUpdated(updatedEntries);
      
      setIsDeleteDialogOpen(false);
      toast.success("Entry deleted successfully");
    } catch (error) {
      console.error("Error deleting budget entry:", error);
      toast.error("Failed to delete entry");
    }
  };
  
  const openEditDialog = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (entryId: string) => {
    setDeleteEntryId(entryId);
    setIsDeleteDialogOpen(true);
  };
  
  const calculateSummary = () => {
    const filteredEntries = getFilteredEntries();
    
    const totalIncome = filteredEntries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
    const totalExpenses = filteredEntries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };
  
  const getFilteredEntries = () => {
    return entries.filter(entry => {
      // Filter by type
      if (filterType !== 'all' && entry.type !== filterType) {
        return false;
      }
      
      // Filter by category
      if (filterCategory !== 'all' && entry.category !== filterCategory) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          entry.description?.toLowerCase().includes(searchLower) ||
          entry.category.toLowerCase().includes(searchLower) ||
          String(entry.amount).includes(searchLower)
        );
      }
      
      return true;
    });
  };
  
  const getSortedEntries = () => {
    const filteredEntries = getFilteredEntries();
    
    return [...filteredEntries].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? Number(a.amount) - Number(b.amount) 
          : Number(b.amount) - Number(a.amount);
      }
      
      if (sortField === 'category') {
        return sortDirection === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      
      return 0;
    });
  };
  
  const uniqueCategories = [...new Set(entries.map(entry => entry.category))];
  const summary = calculateSummary();
  const sortedEntries = getSortedEntries();
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800 dark:text-green-400 flex items-center">
              <ArrowUpCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {formatCurrency(summary.income)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-800 dark:text-red-400 flex items-center">
              <ArrowDownCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-400">
              {formatCurrency(summary.expenses)}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`
          ${summary.balance >= 0 
            ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30" 
            : "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30"}
        `}>
          <CardHeader className="pb-2">
            <CardTitle className={`
              text-lg flex items-center
              ${summary.balance >= 0 
                ? "text-blue-800 dark:text-blue-400" 
                : "text-amber-800 dark:text-amber-400"}
            `}>
              <CheckCircle2 className={`
                h-5 w-5 mr-2
                ${summary.balance >= 0 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-amber-600 dark:text-amber-400"}
              `} />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`
              text-2xl font-bold
              ${summary.balance >= 0 
                ? "text-blue-800 dark:text-blue-400" 
                : "text-amber-800 dark:text-amber-400"}
            `}>
              {formatCurrency(summary.balance)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Entry Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Add New Entry</CardTitle>
          <CardDescription>Record your income or expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setActiveInputId("description")}
                placeholder="Rent payment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">₹</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setActiveInputId("amount")}
                  className="pl-8"
                  placeholder="1000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup 
                value={type} 
                onValueChange={(val) => setType(val as 'income' | 'expense')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer">
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    Expense
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    Income
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                selected={date}
                onSelect={setDate}
              />
            </div>
            
            <div className="flex items-end space-y-2">
              <Button 
                onClick={handleAddEntry}
                disabled={isAddingEntry}
                className="w-full flex items-center gap-2"
              >
                {isAddingEntry ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-start mt-4">
            <VirtualKeyboard targetInputId={activeInputId || undefined} />
            <TextToSpeech text="Add a new entry by filling out the form. You need to provide a description, amount, category, type (income or expense), and date." />
          </div>
        </CardContent>
      </Card>
      
      {/* Filters and Entries Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                Entries
              </CardTitle>
              <CardDescription>
                {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'} found
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={(val) => setFilterType(val as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No entries found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortField === 'date') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('date');
                          setSortDirection('desc');
                        }
                      }}
                    >
                      Date {sortField === 'date' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortField === 'category') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('category');
                          setSortDirection('asc');
                        }
                      }}
                    >
                      Category {sortField === 'category' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => {
                        if (sortField === 'amount') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('amount');
                          setSortDirection('desc');
                        }
                      }}
                    >
                      Amount {sortField === 'amount' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.type === 'income' ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="capitalize">{entry.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={entry.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {entry.type === 'income' ? '+' : '-'}
                          {formatCurrency(entry.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(entry)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(entry.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>
              Update the details of this entry
            </DialogDescription>
          </DialogHeader>
          
          {editingEntry && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({
                    ...editingEntry,
                    description: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">₹</span>
                  </div>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingEntry.amount}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      amount: Number(e.target.value)
                    })}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingEntry.category} 
                  onValueChange={(val) => setEditingEntry({
                    ...editingEntry,
                    category: val
                  })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup 
                  value={editingEntry.type}
                  onValueChange={(val) => setEditingEntry({
                    ...editingEntry,
                    type: val as 'income' | 'expense'
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                    <RadioGroupItem value="expense" id="edit-expense" />
                    <Label htmlFor="edit-expense" className="flex items-center gap-2 cursor-pointer">
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      Expense
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                    <RadioGroupItem value="income" id="edit-income" />
                    <Label htmlFor="edit-income" className="flex items-center gap-2 cursor-pointer">
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      Income
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <DatePicker
                  selected={new Date(editingEntry.date)}
                  onSelect={(date) => setEditingEntry({
                    ...editingEntry,
                    date: date.toISOString()
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEntry}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Entry Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this entry from your budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetSheet;
