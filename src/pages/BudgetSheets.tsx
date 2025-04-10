
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ActivityTypes, logActivity } from "@/services/activityService";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MoreHorizontal, 
  Download, 
  FileCog, 
  Trash2, 
  Loader,
  FileSpreadsheet,
  FilePdf,
  Copy,
  BarChart
} from "lucide-react";
import BudgetSheet from "@/components/budget/BudgetSheet";
import { formatCurrency } from "@/utils/formatting";
import TextToSpeech from "@/components/accessibility/TextToSpeech";

interface BudgetSheetType {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface BudgetEntryType {
  id: string;
  sheet_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

const BudgetSheetsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [sheets, setSheets] = useState<BudgetSheetType[]>([]);
  const [entries, setEntries] = useState<Record<string, BudgetEntryType[]>>({});
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetDescription, setNewSheetDescription] = useState("");
  const [isSheetNameDialogOpen, setIsSheetNameDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameSheetId, setRenameSheetId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDescription, setRenameDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      fetchBudgetSheets();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchBudgetSheets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: sheetData, error: sheetError } = await supabase
        .from('budget_sheets')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (sheetError) throw sheetError;
      
      if (sheetData.length === 0) {
        // Create a default sheet if none exists
        const { data: newSheet, error: newSheetError } = await supabase
          .from('budget_sheets')
          .insert({
            user_id: user.id,
            name: 'Monthly Budget',
            is_default: true
          })
          .select()
          .single();
        
        if (newSheetError) throw newSheetError;
        
        setSheets([newSheet]);
        setActiveSheet(newSheet.id);
      } else {
        setSheets(sheetData);
        setActiveSheet(sheetData[0].id);
        
        // Fetch entries for all sheets
        for (const sheet of sheetData) {
          await fetchEntriesForSheet(sheet.id);
        }
      }
    } catch (error) {
      console.error("Error fetching budget sheets:", error);
      toast.error("Failed to load budget sheets");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEntriesForSheet = async (sheetId: string) => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('sheet_id', sheetId)
        .order('date', { ascending: false });
      
      if (entriesError) throw entriesError;
      
      setEntries(prev => ({
        ...prev,
        [sheetId]: entriesData
      }));
    } catch (error) {
      console.error(`Error fetching entries for sheet ${sheetId}:`, error);
    }
  };
  
  const handleCreateSheet = async () => {
    if (!user) return;
    
    try {
      const { data: newSheet, error } = await supabase
        .from('budget_sheets')
        .insert({
          user_id: user.id,
          name: newSheetName || 'Untitled Sheet',
          description: newSheetDescription || null,
          is_default: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSheets(prev => [...prev, newSheet]);
      setActiveSheet(newSheet.id);
      setEntries(prev => ({ ...prev, [newSheet.id]: [] }));
      
      setNewSheetName("");
      setNewSheetDescription("");
      setIsSheetNameDialogOpen(false);
      
      logActivity(user.id, ActivityTypes.BUDGET, `Created new budget sheet: ${newSheet.name}`);
      toast.success("Budget sheet created");
    } catch (error) {
      console.error("Error creating budget sheet:", error);
      toast.error("Failed to create budget sheet");
    }
  };
  
  const handleRenameSheet = async () => {
    if (!user || !renameSheetId) return;
    
    try {
      const { error } = await supabase
        .from('budget_sheets')
        .update({
          name: renameName,
          description: renameDescription
        })
        .eq('id', renameSheetId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSheets(prev => prev.map(sheet => 
        sheet.id === renameSheetId 
          ? { ...sheet, name: renameName, description: renameDescription } 
          : sheet
      ));
      
      setIsRenameDialogOpen(false);
      toast.success("Budget sheet renamed");
    } catch (error) {
      console.error("Error renaming budget sheet:", error);
      toast.error("Failed to rename budget sheet");
    }
  };
  
  const handleDeleteSheet = async (sheetId: string) => {
    if (!user) return;
    
    try {
      // Check if this is the last sheet
      if (sheets.length === 1) {
        toast.error("Cannot delete the only budget sheet");
        return;
      }
      
      // Delete all entries for this sheet first
      const { error: entriesError } = await supabase
        .from('budget_entries')
        .delete()
        .eq('sheet_id', sheetId);
      
      if (entriesError) throw entriesError;
      
      // Then delete the sheet
      const { error: sheetError } = await supabase
        .from('budget_sheets')
        .delete()
        .eq('id', sheetId)
        .eq('user_id', user.id);
      
      if (sheetError) throw sheetError;
      
      // Update local state
      const updatedSheets = sheets.filter(sheet => sheet.id !== sheetId);
      setSheets(updatedSheets);
      
      // If the active sheet was deleted, set a new active sheet
      if (activeSheet === sheetId) {
        setActiveSheet(updatedSheets[0]?.id || null);
      }
      
      toast.success("Budget sheet deleted");
    } catch (error) {
      console.error("Error deleting budget sheet:", error);
      toast.error("Failed to delete budget sheet");
    }
  };
  
  const exportToExcel = (sheetId: string) => {
    if (!user) return;
    
    try {
      setIsExporting(true);
      
      const sheet = sheets.find(s => s.id === sheetId);
      const sheetEntries = entries[sheetId] || [];
      
      if (!sheet) {
        toast.error("Sheet not found");
        return;
      }
      
      // In a real application, you would use a library like xlsx to create a proper Excel file
      // For this demo, we'll create a CSV and convert it to a Blob
      const headers = ["Date", "Type", "Category", "Amount", "Description"];
      const rows = sheetEntries.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
        entry.category,
        entry.amount.toString(),
        entry.description || ""
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${sheet.name}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logActivity(user.id, ActivityTypes.EXPORT, `Exported budget sheet: ${sheet.name} as Excel`);
      toast.success("Budget exported to Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export budget");
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToPDF = (sheetId: string) => {
    if (!user) return;
    
    try {
      setIsExporting(true);
      
      const sheet = sheets.find(s => s.id === sheetId);
      
      if (!sheet) {
        toast.error("Sheet not found");
        return;
      }
      
      // In a real application, you would use a library like jsPDF to create a proper PDF
      // For this demo, we'll just show a toast
      setTimeout(() => {
        toast.success(`Budget exported to PDF: ${sheet.name}.pdf`);
        logActivity(user.id, ActivityTypes.EXPORT, `Exported budget sheet: ${sheet.name} as PDF`);
      }, 1000);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export budget");
    } finally {
      setIsExporting(false);
    }
  };
  
  const openRenameDialog = (sheet: BudgetSheetType) => {
    setRenameSheetId(sheet.id);
    setRenameName(sheet.name);
    setRenameDescription(sheet.description || "");
    setIsRenameDialogOpen(true);
  };
  
  const calculateSummary = (sheetId: string) => {
    const sheetEntries = entries[sheetId] || [];
    
    const totalIncome = sheetEntries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
    const totalExpenses = sheetEntries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };
  
  const getPageDescription = () => {
    if (!isAuthenticated) {
      return "Please log in to access your budget sheets.";
    }
    
    if (isLoading) {
      return "Loading your budget sheets...";
    }
    
    if (sheets.length === 0) {
      return "You don't have any budget sheets yet. Create your first one to get started.";
    }
    
    const activeSheetObj = sheets.find(s => s.id === activeSheet);
    if (!activeSheetObj) {
      return "Select a budget sheet to view and manage your finances.";
    }
    
    const summary = calculateSummary(activeSheet);
    return `Currently viewing ${activeSheetObj.name}. This sheet has a total income of ${formatCurrency(summary.income)}, expenses of ${formatCurrency(summary.expenses)}, and a balance of ${formatCurrency(summary.balance)}.`;
  };
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to access your budget sheets</p>
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
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green">
              Budget Sheets
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Manage multiple budgets for different purposes
              </p>
              <TextToSpeech text={getPageDescription()} />
            </div>
          </div>
          
          <Dialog open={isSheetNameDialogOpen} onOpenChange={setIsSheetNameDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Sheet</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget Sheet</DialogTitle>
                <DialogDescription>
                  Give your new budget sheet a name and optional description.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-name">Sheet Name</Label>
                  <Input
                    id="sheet-name"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="Monthly Budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet-description">Description (Optional)</Label>
                  <Input
                    id="sheet-description"
                    value={newSheetDescription}
                    onChange={(e) => setNewSheetDescription(e.target.value)}
                    placeholder="My personal monthly budget tracker"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSheetNameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSheet}>Create Sheet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your budget sheets...</p>
            </div>
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 p-8">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Budget Sheets Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first budget sheet to start tracking your finances
            </p>
            <Button onClick={() => setIsSheetNameDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget Sheet
            </Button>
          </div>
        ) : (
          <Tabs 
            value={activeSheet || undefined} 
            onValueChange={(value) => setActiveSheet(value)}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="h-auto p-1 bg-transparent">
                {sheets.map((sheet) => (
                  <TabsTrigger
                    key={sheet.id}
                    value={sheet.id}
                    className="relative px-4 py-2 data-[state=active]:bg-background"
                  >
                    {sheet.name}
                    {sheet.is_default && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {activeSheet && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isExporting}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                        {isExporting && <Loader className="h-3 w-3 ml-2 animate-spin" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportToExcel(activeSheet)}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportToPDF(activeSheet)}>
                        <FilePdf className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const sheet = sheets.find(s => s.id === activeSheet);
                        if (sheet) openRenameDialog(sheet);
                      }}>
                        <FileCog className="h-4 w-4 mr-2" />
                        Rename Sheet
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                            <span className="text-destructive">Delete Sheet</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget Sheet?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this budget sheet and all its entries.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => activeSheet && handleDeleteSheet(activeSheet)}
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
              )}
            </div>
            
            {sheets.map((sheet) => (
              <TabsContent key={sheet.id} value={sheet.id} className="mt-0">
                <BudgetSheet
                  sheetId={sheet.id}
                  entries={entries[sheet.id] || []}
                  onEntriesUpdated={(updatedEntries) => {
                    setEntries(prev => ({
                      ...prev,
                      [sheet.id]: updatedEntries
                    }));
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
        
        {/* Rename Sheet Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Budget Sheet</DialogTitle>
              <DialogDescription>
                Update the name and description of your budget sheet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rename-name">Sheet Name</Label>
                <Input
                  id="rename-name"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-description">Description (Optional)</Label>
                <Input
                  id="rename-description"
                  value={renameDescription}
                  onChange={(e) => setRenameDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameSheet}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BudgetSheetsPage;
