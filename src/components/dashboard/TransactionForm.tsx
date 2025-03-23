
import React, { useState } from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Category } from "@/utils/mockData";
import { toast } from "sonner";

interface TransactionFormProps {
  newTransaction: {
    amount: string;
    description: string;
    category: string;
    type: string;
  };
  setNewTransaction: React.Dispatch<React.SetStateAction<{
    amount: string;
    description: string;
    category: string;
    type: string;
  }>>;
  categories: Category[];
  handleAddTransaction: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  newTransaction,
  setNewTransaction,
  categories,
  handleAddTransaction,
}) => {
  const [transactionType, setTransactionType] = useState(newTransaction.type);

  const handleTypeChange = (type: string) => {
    setTransactionType(type);
    setNewTransaction({
      ...newTransaction,
      type,
    });
  };

  const handleSubmit = () => {
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!newTransaction.description) {
      toast.error("Please enter a description");
      return;
    }
    
    if (!newTransaction.category) {
      toast.error("Please select a category");
      return;
    }
    
    handleAddTransaction();
  };

  return (
    <GlassmorphicCard>
      <CardHeader className="pb-2">
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>
          Record your finances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={transactionType === "expense" ? "default" : "outline"}
              className={transactionType === "expense" ? "bg-budget-red hover:bg-budget-red/90" : ""}
              onClick={() => handleTypeChange("expense")}
            >
              Expense
            </Button>
            <Button
              variant={transactionType === "income" ? "default" : "outline"}
              className={transactionType === "income" ? "bg-budget-green hover:bg-budget-green/90" : ""}
              onClick={() => handleTypeChange("income")}
            >
              Income
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className="pl-8 input-focus-ring"
                min="0"
                step="1"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              className="input-focus-ring"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  category: e.target.value,
                })
              }
            >
              <option value="">Select a category</option>
              {categories
                .filter((c) => c.budget)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
          >
            Add Transaction
          </Button>
        </div>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default TransactionForm;
