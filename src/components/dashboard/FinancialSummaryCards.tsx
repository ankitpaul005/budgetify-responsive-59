
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-md p-4">
        <div className="absolute top-3 right-3 bg-budget-green-light text-budget-green rounded-full p-2.5">
          <Wallet className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Current Balance
        </h3>
        {userIncome !== undefined ? (
          <p className="text-3xl md:text-4xl font-bold mb-2">
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
      
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-md p-4">
        <div className="absolute top-3 right-3 flex gap-2">
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-10 w-10 bg-budget-blue-light text-budget-blue rounded-full p-2.5">
                <Edit className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
          <div className="bg-budget-blue-light text-budget-blue rounded-full p-2.5">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Total Income
        </h3>
        {userIncome !== undefined && userIncome > 0 ? (
          <p className="text-3xl md:text-4xl font-bold mb-2">
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
      
      <GlassmorphicCard className="relative overflow-hidden transition-all hover:shadow-md p-4">
        <div className="absolute top-3 right-3 bg-budget-red-light text-budget-red rounded-full p-2.5">
          <CreditCard className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-3">
          Total Expenses
        </h3>
        {expenses > 0 || hasTransactions ? (
          <p className="text-3xl md:text-4xl font-bold mb-2">
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
