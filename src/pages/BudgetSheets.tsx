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
  FileText,
  Copy,
  BarChart,
  UserPlus,
  Users,
  ShieldCheck,
  Eye,
  Edit,
  Lock,
  User
} from "lucide-react";
import BudgetSheet from "@/components/budget/BudgetSheet";
import { formatCurrency } from "@/utils/formatting";
import TextToSpeech from "@/components/accessibility/TextToSpeech";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getBudgetDiaryMembers, 
  addBudgetDiaryMember, 
  removeBudgetDiaryMember,
  BudgetDiaryMember,
  BudgetAccessLevel
} from "@/services/budgetDiaryService";

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
  updated_at?: string;
  user_id?: string;
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
  
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<BudgetAccessLevel>("viewer");
  const [sheetMembers, setSheetMembers] = useState<BudgetDiaryMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      fetchBudgetSheets();
    }
  }, [isAuthenticated, user, navigate]);
  
  useEffect(() => {
    if (activeSheet) {
      fetchSheetMembers(activeSheet);
    }
  }, [activeSheet]);
  
  const fetchSheetMembers = async (sheetId: string) => {
    if (!user) return;
    
    try {
      setIsMembersLoading(true);
      const members = await getBudgetDiaryMembers(sheetId);
      setSheetMembers(members);
    } catch (error) {
      console.error("Error fetching sheet members:", error);
    } finally {
      setIsMembersLoading(false);
    }
  };
  
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
        const { data: newSheet, error: newSheetError } = await supabase
          .from('budget_sheets')
          .insert({
            user_id: user.id,
            name: 'Monthly Budget Diary',
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
        
        for (const sheet of sheetData) {
          await fetchEntriesForSheet(sheet.id);
        }
      }
    } catch (error) {
      console.error("Error fetching budget sheets:", error);
      toast.error("Failed to load budget diaries");
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
      
      const typedEntries: BudgetEntryType[] = entriesData.map(entry => ({
        ...entry,
        type: entry.type as 'income' | 'expense'
      }));
      
      setEntries(prev => ({
        ...prev,
        [sheetId]: typedEntries
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
          name: newSheetName || 'Untitled Budget Diary',
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
      
      logActivity(user.id, ActivityTypes.BUDGET, `Created new budget diary: ${newSheet.name}`);
      toast.success("Budget diary created");
    } catch (error) {
      console.error("Error creating budget diary:", error);
      toast.error("Failed to create budget diary");
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
      toast.success("Budget diary renamed");
    } catch (error) {
      console.error("Error renaming budget diary:", error);
      toast.error("Failed to rename budget diary");
    }
  };
  
  const handleDeleteSheet = async (sheetId: string) => {
    if (!user) return;
    
    try {
      if (sheets.length === 1) {
        toast.error("Cannot delete the only budget diary");
        return;
      }
      
      const { error: entriesError } = await supabase
        .from('budget_entries')
        .delete()
        .eq('sheet_id', sheetId);
      
      if (entriesError) throw entriesError;
      
      try {
        const { error: membersError } = await supabase
          .from('budget_diary_members')
          .delete()
          .eq('budget_id', sheetId);
          
        if (membersError) console.error("Error deleting sheet members:", membersError);
      } catch (error) {
        console.error("Error with members deletion:", error);
      }
      
      const { error: sheetError } = await supabase
        .from('budget_sheets')
        .delete()
        .eq('id', sheetId)
        .eq('user_id', user.id);
      
      if (sheetError) throw sheetError;
      
      const updatedSheets = sheets.filter(sheet => sheet.id !== sheetId);
      setSheets(updatedSheets);
      
      if (activeSheet === sheetId) {
        setActiveSheet(updatedSheets[0]?.id || null);
      }
      
      toast.success("Budget diary deleted");
    } catch (error) {
      console.error("Error deleting budget diary:", error);
      toast.error("Failed to delete budget diary");
    }
  };
  
  const handleShareSheet = async () => {
    if (!user || !activeSheet) return;
    
    try {
      const success = await addBudgetDiaryMember(activeSheet, inviteEmail, accessLevel);
      
      if (success) {
        await fetchSheetMembers(activeSheet);
        setInviteEmail("");
        setAccessLevel("viewer");
        logActivity(user.id, ActivityTypes.BUDGET, `Shared budget diary with ${inviteEmail}`);
      }
    } catch (error) {
      console.error("Error sharing budget diary:", error);
      toast.error("Failed to share budget diary");
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!user || !activeSheet) return;
    
    try {
      const success = await removeBudgetDiaryMember(activeSheet, memberId);
      
      if (success) {
        setSheetMembers(prev => prev.filter(member => member.user_id !== memberId));
        toast.success("Member removed from budget diary");
        logActivity(user.id, ActivityTypes.BUDGET, "Removed member from budget diary");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
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
      
      logActivity(user.id, ActivityTypes.EXPORT, `Exported budget diary: ${sheet.name} as Excel`);
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
      
      setTimeout(() => {
        toast.success(`Budget exported to PDF: ${sheet.name}.pdf`);
        logActivity(user.id, ActivityTypes.EXPORT, `Exported budget diary: ${sheet.name} as PDF`);
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
      return "Please log in to access your budget diaries.";
    }
    
    if (isLoading) {
      return "Loading your budget diaries...";
    }
    
    if (sheets.length === 0) {
      return "You don't have any budget diaries yet. Create your first one to get started.";
    }
    
    const activeSheetObj = sheets.find(s => s.id === activeSheet);
    if (!activeSheetObj) {
      return "Select a budget diary to view and manage your finances.";
    }
    
    const summary = calculateSummary(activeSheet);
    return `Currently viewing ${activeSheetObj.name}. This diary has a total income of ${formatCurrency(summary.income)}, expenses of ${formatCurrency(summary.expenses)}, and a balance of ${formatCurrency(summary.balance)}.`;
  };
  
  // Properly check if the user is the owner
  const isOwner = user && activeSheet && sheets.find(s => s.id === activeSheet)?.user_id === user.id;
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to access your budget diaries</p>
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
              Budget Diary
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
                <span>New Diary</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget Diary</DialogTitle>
                <DialogDescription>
                  Give your new budget diary a name and optional description.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-name">Diary Name</Label>
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
                <Button onClick={handleCreateSheet}>Create Diary</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your budget diaries...</p>
            </div>
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 p-8">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Budget Diaries Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first budget diary to start tracking your finances
            </p>
            <Button onClick={() => setIsSheetNameDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget Diary
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
                  {isOwner && (
                    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <UserPlus className="h-4 w-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Budget Diary</DialogTitle>
                          <DialogDescription>
                            Invite others to view or edit this budget diary.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label htmlFor="invite-email">Email Address</Label>
                              <Input
                                id="invite-email"
                                type="email"
                                placeholder="user@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="access-level">Access Level</Label>
                              <Select
                                value={accessLevel}
                                onValueChange={(value) => setAccessLevel(value as BudgetAccessLevel)}
                              >
                                <SelectTrigger id="access-level">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">
                                    <div className="flex items-center gap-2">
                                      <Eye className="h-4 w-4" />
                                      <span>Viewer</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="editor">
                                    <div className="flex items-center gap-2">
                                      <Edit className="h-4 w-4" />
                                      <span>Editor</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={handleShareSheet}
                            disabled={!inviteEmail}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite User
                          </Button>
                          
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">People with Access</h4>
                            {isMembersLoading ? (
                              <div className="flex justify-center py-4">
                                <Loader className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : sheetMembers.length === 0 ? (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                No shared access yet
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {user && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {user?.email?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{user?.email}</p>
                                        <p className="text-xs text-muted-foreground">You (Owner)</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 flex items-center">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        <span>Owner</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {sheetMembers.map(member => (
                                  <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {member.user_name?.[0] || member.user_email?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{member.user_name || member.user_email}</p>
                                        <p className="text-xs text-muted-foreground">{member.user_email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`${
                                        member.access_level === 'editor' 
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      } text-xs rounded-full px-2 py-0.5 flex items-center`}>
                                        {member.access_level === 'editor' ? (
                                          <>
                                            <Edit className="h-3 w-3 mr-1" />
                                            <span>Editor</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="h-3 w-3 mr-1" />
                                            <span>Viewer</span>
                                          </>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveMember(member.user_id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
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
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {isOwner && (
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
                          Rename Diary
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                              <span className="text-destructive">Delete Diary</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Budget Diary?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this budget diary and all its entries.
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
                  )}
                </div>
              )}
            </div>
            
            {sheets.map((sheet) => (
              <TabsContent key={sheet.id} value={sheet.id} className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{sheet.name}</h2>
                    {sheet.description && (
                      <p className="text-sm text-muted-foreground">{sheet.description}</p>
                    )}
                  </div>
                  
                  {sheetMembers.length > 0 && (
                    <div className="flex -space-x-2 mr-2">
                      {sheetMembers.slice(0, 3).map(member => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback>
                            {member.user_name?.[0] || member.user_email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {sheetMembers.length > 3 && (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{sheetMembers.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
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
        
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Budget Diary</DialogTitle>
              <DialogDescription>
                Update the name and description of your budget diary.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rename-name">Diary Name</Label>
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
