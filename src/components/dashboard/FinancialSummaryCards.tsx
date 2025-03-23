
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { Wallet, CircleDollarSign, CreditCard, InfoIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatting";

interface FinancialSummaryCardsProps {
  balance: number;
  userIncome: number | undefined;
  expenses: number;
  incomeDialogOpen: boolean;
  setIncomeDialogOpen: (open: boolean) => void;
  newIncome: string;
  setNewIncome: (income: string) => void;
  handleUpdateIncome: () => void;
  hasTransactions: boolean;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  balance,
  userIncome,
  expenses,
  incomeDialogOpen,
  setIncomeDialogOpen,
  newIncome,
  setNewIncome,
  handleUpdateIncome,
  hasTransactions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
          <Wallet className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Current Balance
        </h3>
        {userIncome ? (
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(balance)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Update your income to see balance</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>This month</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-2">
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 bg-budget-blue-light text-budget-blue rounded-full p-2">
                <Edit className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Monthly Income</DialogTitle>
                <DialogDescription>
                  Enter your new monthly income amount.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income (₹)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={newIncome}
                    onChange={(e) => setNewIncome(e.target.value)}
                    placeholder="Enter your monthly income"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpdateIncome}
                  className="bg-budget-blue hover:bg-budget-blue/90"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="bg-budget-blue-light text-budget-blue rounded-full p-2">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Total Income
        </h3>
        {userIncome ? (
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(userIncome)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Click edit to update income</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Monthly Income</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-budget-red-light text-budget-red rounded-full p-2">
          <CreditCard className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Total Expenses
        </h3>
        {expenses > 0 || hasTransactions ? (
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(expenses)}
          </p>
        ) : (
          <div className="flex items-center py-2">
            <InfoIcon className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">No expenses tracked yet</p>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>This month</span>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default FinancialSummaryCards;
