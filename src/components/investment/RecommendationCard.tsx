
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatting";
import { InvestmentRecommendation } from "@/utils/investmentRecommendationUtils";
import { ArrowUpRight, Zap, ArrowRightCircle } from "lucide-react";

interface RecommendationCardProps {
  recommendation: InvestmentRecommendation;
  currency?: string; // Add currency prop
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  currency = "INR" // Default to INR
}) => {
  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg">{recommendation.name}</h3>
          <p className="text-xs text-muted-foreground">{recommendation.description}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full flex items-center ${
          recommendation.priority === 'High' 
            ? 'bg-budget-red-light text-budget-red' 
            : recommendation.priority === 'Medium'
            ? 'bg-budget-yellow-light text-budget-yellow'
            : 'bg-budget-green-light text-budget-green'
        }`}>
          <Zap className="h-3 w-3 mr-1" />
          {recommendation.priority} Priority
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Allocation</p>
          <p className="font-medium">{formatCurrency(recommendation.allocation, currency)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Percentage</p>
          <p className="font-medium">{recommendation.percentage}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Risk Level</p>
          <p className="font-medium">{recommendation.riskLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Expected Return</p>
          <p className="font-medium text-budget-green">{recommendation.returnRate}</p>
        </div>
      </div>
      
      <div className="text-xs mb-4">
        <p className="text-muted-foreground">Suggested Instrument</p>
        <p className="font-medium">{recommendation.instrument}</p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-auto gap-1 w-full"
        onClick={() => toast.info(`Investment in ${recommendation.name} will be added soon!`)}
      >
        <span>Invest Now</span>
        <ArrowRightCircle className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default RecommendationCard;
