
import React from "react";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

interface AvailableFundsCardProps {
  availableFunds: number;
}

const AvailableFundsCard: React.FC<AvailableFundsCardProps> = ({ availableFunds }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-budget-green" />
        <div>
          <h3 className="font-medium">Available for Investment</h3>
          <p className="text-sm text-muted-foreground">Recommended allocation across assets</p>
        </div>
      </div>
      <span className="text-xl font-semibold">{formatCurrency(availableFunds)}</span>
    </div>
  );
};

export default AvailableFundsCard;
