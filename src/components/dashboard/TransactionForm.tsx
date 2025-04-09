
import React, { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatting";
import { supabase } from "@/integrations/supabase/client";
import { ActivityTypes, logActivity } from "@/services/activityService";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, CreditCard, Calendar, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import AccessibilityTools from "@/components/accessibility/AccessibilityTools";
import VirtualKeyboard from "@/components/accessibility/VirtualKeyboard";
import TextToSpeech from "@/components/accessibility/TextToSpeech";

interface TransactionFormProps {
  userId?: string; // Make userId optional
  onAddTransaction: (transaction: any) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ userId, onAddTransaction }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Authentication required", {
        description: "Please login to add transactions"
      });
      return;
    }
    
    if (!description || !amount || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const newTransaction = {
        user_id: userId,
        description,
        amount: Number(amount),
        category,
        type,
        date: date.toISOString()
      };

      const { data, error } = await supabase.from("transactions").insert([newTransaction]).select();
      
      if (error) throw error;

      // Log transaction activity
      logActivity(
        userId, 
        ActivityTypes.TRANSACTION, 
        `Added ${type} transaction: ${description} (${formatCurrency(Number(amount))})`
      );

      setDescription("");
      setAmount("");
      setCategory("");
      setType("expense");
      setDate(new Date());
      
      toast.success("Transaction added successfully");
      
      // Pass the new transaction with its ID back to the parent component
      if (data && data[0]) {
        onAddTransaction(data[0]);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate form description for screen readers
  const getFormDescription = () => {
    return "Transaction form. Fill out the details to add a new transaction. Required fields are: Description, Amount, and Category. You can also select the transaction type as either expense or income, and pick a date.";
  };

  return (
    <GlassmorphicCard className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-slate-900 shadow-lg border-t border-l border-white/20 dark:border-white/5">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-budget-green" />
              Add Transaction
            </CardTitle>
            <CardDescription>
              Record your income and expenses
            </CardDescription>
          </div>
          <TextToSpeech text={getFormDescription()} buttonLabel="Form Info" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-1 block">Description</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                id="description"
                placeholder="What was it for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setActiveInputId("description")}
                className="pl-10"
                required
                aria-describedby="description-help"
              />
              <span id="description-help" className="sr-only">
                Enter a description for your transaction, such as "Grocery shopping" or "Salary payment"
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-1 block">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">₹</span>
              </div>
              <Input
                type="number"
                id="amount"
                placeholder="How much?"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={() => setActiveInputId("amount")}
                className="pl-8"
                required
                aria-describedby="amount-help"
              />
              <span id="amount-help" className="sr-only">
                Enter the transaction amount in rupees. Use numbers only.
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium mb-1 block">Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category" className="w-full" aria-describedby="category-help">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Investments">Investments</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <span id="category-help" className="sr-only">
              Select a category for this transaction, such as Food, Transportation, or Salary
            </span>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Type</Label>
            <RadioGroup 
              defaultValue="expense" 
              className="flex gap-4" 
              value={type}
              onValueChange={(value) => setType(value)}
              aria-describedby="type-help"
            >
              <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer">
                  <ArrowDownCircle className="h-4 w-4 text-budget-red" />
                  Expense
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-border rounded-md px-4 py-2 hover:bg-muted/20 transition-colors">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer">
                  <ArrowUpCircle className="h-4 w-4 text-budget-green" />
                  Income
                </Label>
              </div>
            </RadioGroup>
            <span id="type-help" className="sr-only">
              Select whether this is an expense (money going out) or income (money coming in)
            </span>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date
            </Label>
            <DatePicker
              selected={date}
              onSelect={setDate}
              required
              aria-describedby="date-help"
            />
            <span id="date-help" className="sr-only">
              Select the date of the transaction. Defaults to today.
            </span>
          </div>

          <div className="flex justify-between items-center">
            <VirtualKeyboard targetInputId={activeInputId || undefined} />
            
            <Button 
              type="submit" 
              className="mt-2 bg-gradient-to-r from-budget-blue to-budget-green text-white"
              disabled={isSubmitting || !userId}
              aria-describedby="submit-help"
            >
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
            <span id="submit-help" className="sr-only">
              Click to add the transaction with the information you've provided
            </span>
          </div>
          
          {!userId && (
            <p className="text-sm text-center text-muted-foreground">
              You need to be logged in to add transactions
            </p>
          )}
        </form>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default TransactionForm;
