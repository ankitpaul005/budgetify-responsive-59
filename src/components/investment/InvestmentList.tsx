
import React from "react";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { Investment } from "@/utils/mockData";
import { differenceInDays, differenceInMonths } from "date-fns";

interface InvestmentListProps {
  investments: Investment[];
}

const InvestmentList: React.FC<InvestmentListProps> = ({ investments }) => {
  // Calculate days since investment started and annualized return
  const calculateInvestmentMetrics = (investment: Investment) => {
    const startDate = new Date(investment.startDate);
    const now = new Date();
    const daysSinceStart = differenceInDays(now, startDate);
    const monthsSinceStart = differenceInMonths(now, startDate);
    
    // Annualized return calculation
    const totalReturn = (investment.value - investment.initialValue) / investment.initialValue;
    const annualizedReturn = monthsSinceStart > 0 
      ? ((1 + totalReturn) ** (12 / monthsSinceStart) - 1) * 100 
      : totalReturn * 100;
    
    return {
      daysSinceStart,
      annualizedReturn: isNaN(annualizedReturn) ? 0 : annualizedReturn,
    };
  };

  return (
    <GlassmorphicCard>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Your Investments</CardTitle>
          <Button 
            size="sm"
            onClick={() => toast.info("Add investment feature coming soon!")}
          >
            Add New
          </Button>
        </div>
        <CardDescription>
          Track and manage your investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {investments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No investments found
            </div>
          ) : (
            investments.map((investment) => {
              const { daysSinceStart } = calculateInvestmentMetrics(investment);
              const gain = investment.value - investment.initialValue;
              const returnPercent = (gain / investment.initialValue) * 100;
              
              return (
                <div
                  key={investment.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{investment.name}</h3>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {investment.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-medium">{formatCurrency(investment.value)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Investment</p>
                      <p className="font-medium">{formatCurrency(investment.initialValue)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {returnPercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-budget-green" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-budget-red" />
                      )}
                      <span className={`text-sm font-medium ${
                        returnPercent >= 0 ? "text-budget-green" : "text-budget-red"
                      }`}>
                        {returnPercent >= 0 ? "+" : ""}
                        {formatPercent(returnPercent)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({gain >= 0 ? "+" : ""}{formatCurrency(gain)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>{daysSinceStart} days</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default InvestmentList;
