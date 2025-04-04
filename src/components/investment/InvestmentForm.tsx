
import React, { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatting";
import { v4 as uuidv4 } from "uuid";
import { ActivityTypes, logActivity } from "@/services/activityService";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAuth } from "@/context/AuthContext";

const InvestmentForm = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  
  const [investments, setInvestments] = useLocalStorage<any[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !value || !initialValue || !returnRate || !type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const newInvestment = {
        id: uuidv4(),
        name,
        value: Number(value),
        initialValue: Number(initialValue),
        returnRate: Number(returnRate),
        type,
        startDate: startDate.toISOString()
      };

      // Log investment activity
      if (user) {
        logActivity(
          user.id, 
          ActivityTypes.INVESTMENT, 
          `Added investment: ${name} (${formatCurrency(Number(value))})`
        );
      }

      // Add the new investment to localStorage
      setInvestments([newInvestment, ...investments]);
      
      // Reset form
      setName("");
      setValue("");
      setInitialValue("");
      setReturnRate("");
      setType("");
      setStartDate(new Date());
      
      toast.success("Investment added successfully");
    } catch (error) {
      console.error("Error adding investment:", error);
      toast.error("Failed to add investment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Investment Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Investment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Investment Type</Label>
          <Select onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Stocks">Stocks</SelectItem>
              <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Bonds">Bonds</SelectItem>
              <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentValue">Current Value</Label>
          <Input
            type="number"
            id="currentValue"
            placeholder="Current Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="initialValue">Initial Investment</Label>
          <Input
            type="number"
            id="initialValue"
            placeholder="Initial Investment"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="returnRate">Expected Annual Return (%)</Label>
          <Input
            type="number"
            id="returnRate"
            placeholder="Expected Return %"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <DatePicker
            selected={startDate}
            onSelect={setStartDate}
            required
          />
        </div>
      </div>

      <Button type="submit">Add Investment</Button>
    </form>
  );
};

export default InvestmentForm;
