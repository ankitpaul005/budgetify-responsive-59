
import React, { useState } from "react";
import { v4 as uuidv4 } from "@/node_modules/uuid"; // Updated import path
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

const TransactionForm = ({ userId, onAddTransaction }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    const newTransaction = {
      // Remove the uuidv4() call as Supabase will generate the ID
      user_id: userId,
      description,
      amount: Number(amount),
      category,
      type,
      date: date.toISOString()
    };

    try {
      const { data, error } = await supabase.from("transactions").insert([newTransaction]);
      
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            type="number"
            id="amount"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={setCategory}>
          <SelectTrigger className="w-full">
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
      </div>

      <div>
        <Label>Type</Label>
        <RadioGroup defaultValue="expense" className="flex gap-2" onValueChange={(value) => setType(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="r1" />
            <Label htmlFor="r1">Expense</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="r2" />
            <Label htmlFor="r2">Income</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Date</Label>
        <DatePicker
          selected={date}
          onSelect={setDate}
          required
        />
      </div>

      <Button type="submit">Add Transaction</Button>
    </form>
  );
};

export default TransactionForm;
