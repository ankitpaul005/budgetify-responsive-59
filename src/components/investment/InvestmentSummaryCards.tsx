
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { TrendingUp, Percent } from "lucide-react";
import { formatCurrency, formatPercent } from "@/utils/formatting";

interface InvestmentSummaryCardsProps {
  totalValue: number;
  totalGain: number;
  totalReturnPercent: number;
  investments: any[];
  projectedValue: number;
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({
  totalValue,
  totalGain,
  totalReturnPercent,
  investments,
  projectedValue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-budget-blue-light text-budget-blue rounded-full p-2">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Total Portfolio Value
        </h3>
        <p className="text-3xl font-bold mb-1">{formatCurrency(totalValue)}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Across {investments.length} investments</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Total Gain/Loss
        </h3>
        <p className={`text-3xl font-bold mb-1 ${
          totalGain >= 0 ? "text-budget-green" : "text-budget-red"
        }`}>
          {totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)}
        </p>
        <div className="flex items-center text-sm">
          <span className={totalReturnPercent >= 0 ? "text-budget-green" : "text-budget-red"}>
            {totalReturnPercent >= 0 ? "+" : ""}
            {formatPercent(totalReturnPercent)}
          </span>
          <span className="text-muted-foreground ml-1">Total return</span>
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-budget-yellow-light text-budget-yellow rounded-full p-2">
          <Percent className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Projected Growth
        </h3>
        <p className="text-3xl font-bold mb-1">
          {formatCurrency(projectedValue)}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Estimated value in 2 years</span>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default InvestmentSummaryCards;
