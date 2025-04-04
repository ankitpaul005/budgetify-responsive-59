
import React from "react";
import { formatCurrency } from "@/utils/formatting";

interface AvailableFundsCardProps {
  availableFunds: number;
  currency?: string; // Add currency prop
}

const AvailableFundsCard: React.FC<AvailableFundsCardProps> = ({ 
  availableFunds, 
  currency = "INR" // Default to INR
}) => {
  return (
    <div className="border border-border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-lg font-medium mb-1">Available for Investment</h3>
          <p className="text-sm text-muted-foreground">Recommended allocation based on your income</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-budget-green">{formatCurrency(availableFunds, currency)}</div>
          <div className="text-xs text-muted-foreground">per month</div>
        </div>
      </div>
    </div>
  );
};

export default AvailableFundsCard;
