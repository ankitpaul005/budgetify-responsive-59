
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/utils/mockData";
import { ActivityTypes, logActivity } from "@/services/activityService";
import { useAuth } from "@/context/AuthContext";

export interface TransactionFormProps {
  categories: Category[];
  handleAddTransaction: () => Promise<void>;
  newTransaction: {
    amount: string;
    description: string;
    category: string;
    type: "income" | "expense";
  };
  setNewTransaction: React.Dispatch<
    React.SetStateAction<{
      amount: string;
      description: string;
      category: string;
      type: "income" | "expense";
    }>
  >;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  handleAddTransaction,
  newTransaction,
  setNewTransaction,
}) => {
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddTransaction();
    
    // Log activity
    if (user) {
      const actionType = newTransaction.type === "income" ? "received" : "spent";
      const amount = parseFloat(newTransaction.amount);
      
      if (!isNaN(amount)) {
        await logActivity(
          user.id,
          ActivityTypes.TRANSACTION,
          `${actionType === "received" ? "Received" : "Spent"} $${amount.toFixed(2)} for ${newTransaction.description}`
        );
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="transaction-type"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Type
              </label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) =>
                  setNewTransaction({
                    ...newTransaction,
                    type: value as "income" | "expense",
                  })
                }
              >
                <SelectTrigger
                  id="transaction-type"
                  className="w-full"
                  aria-label="Select transaction type"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Category
            </label>
            <Select
              value={newTransaction.category}
              onValueChange={(value) =>
                setNewTransaction({
                  ...newTransaction,
                  category: value,
                })
              }
            >
              <SelectTrigger
                id="category"
                className="w-full"
                aria-label="Select category"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
