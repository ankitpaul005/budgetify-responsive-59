
import React from "react";
import { TrendingUp, TrendingDown, BarChart3, ChevronDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { Investment } from "@/utils/mockData";
import { Card } from "@/components/ui/card";

export interface InvestmentSummaryCardsProps {
  totalValue: number;
  totalGain: number;
  totalReturnPercent: number;
  investments: Investment[];
  projectedValue: number;
  currency?: string; // Added currency prop
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({
  totalValue,
  totalGain,
  totalReturnPercent,
  investments,
  projectedValue,
  currency = "INR", // Default to INR
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 border-l-4 border-l-budget-green">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalValue, currency)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{investments.length} investments</p>
          </div>
          <div className="bg-budget-green-light dark:bg-budget-green/20 p-2 rounded-full">
            <BarChart3 className="h-5 w-5 text-budget-green" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-budget-blue">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Gain/Loss</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalGain, currency)}</h3>
            <p className={`text-xs flex items-center ${
              totalReturnPercent >= 0 ? "text-budget-green" : "text-budget-red"
            }`}>
              {totalReturnPercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatPercent(totalReturnPercent)}
            </p>
          </div>
          <div className={`p-2 rounded-full ${
            totalGain >= 0 
              ? "bg-budget-green-light dark:bg-budget-green/20" 
              : "bg-budget-red-light dark:bg-budget-red/20"
          }`}>
            {totalGain >= 0 
              ? <TrendingUp className="h-5 w-5 text-budget-green" /> 
              : <TrendingDown className="h-5 w-5 text-budget-red" />}
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-budget-purple">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Projected Value (2Y)</p>
            <h3 className="text-2xl font-bold">{formatCurrency(projectedValue, currency)}</h3>
            <p className="text-xs text-budget-green flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {formatPercent((projectedValue - totalValue) / totalValue * 100)} growth
            </p>
          </div>
          <div className="bg-budget-purple-light dark:bg-budget-purple/20 p-2 rounded-full">
            <TrendingUp className="h-5 w-5 text-budget-purple" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-budget-yellow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Top Performing</p>
            {investments.length > 0 ? (
              <>
                <h3 className="text-xl font-medium">{
                  investments
                    .sort((a, b) => b.returnRate - a.returnRate)[0]?.name || "None"
                }</h3>
                <p className="text-xs text-budget-green flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {formatPercent(
                    investments
                      .sort((a, b) => b.returnRate - a.returnRate)[0]?.returnRate || 0
                  )}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium">No investments</h3>
                <p className="text-xs text-muted-foreground mt-1">Add investments to track performance</p>
              </>
            )}
          </div>
          <div className="bg-budget-yellow-light dark:bg-budget-yellow/20 p-2 rounded-full">
            <TrendingUp className="h-5 w-5 text-budget-yellow" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentSummaryCards;
