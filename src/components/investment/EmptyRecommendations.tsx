
import React from "react";
import { AlertTriangle } from "lucide-react";

interface EmptyRecommendationsProps {
  hasIncomeInfo: boolean;
}

const EmptyRecommendations: React.FC<EmptyRecommendationsProps> = ({ hasIncomeInfo }) => {
  return (
    <div className="flex items-center justify-center py-8 px-4 text-center">
      <div>
        <AlertTriangle className="h-10 w-10 text-budget-yellow mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-1">
          {!hasIncomeInfo 
            ? "Income Information Required" 
            : "Insufficient Funds for Recommendations"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {!hasIncomeInfo 
            ? "Please update your income information to receive tailored investment recommendations."
            : "Add funds to your account to get personalized investment recommendations."}
        </p>
      </div>
    </div>
  );
};

export default EmptyRecommendations;
