
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatting";
import { toast } from "sonner";
import { InvestmentRecommendation } from "@/utils/investmentRecommendationUtils";

interface RecommendationCardProps {
  recommendation: InvestmentRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg">{recommendation.name}</h3>
        <div className="rounded-full bg-primary/10 text-primary text-xs px-2 py-1">
          {recommendation.percentage}%
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span>Recommended Amount:</span>
          <span className="font-medium">{formatCurrency(recommendation.allocation)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Risk Level:</span>
          <span className="font-medium">{recommendation.riskLevel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Expected Return:</span>
          <span className="font-medium text-budget-green">{recommendation.returnRate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Suggested Instrument:</span>
          <span className="font-medium">{recommendation.instrument}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full gap-2 mt-2"
        onClick={() => toast.info(`Investment in ${recommendation.name} coming soon!`)}
      >
        Invest Now <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default RecommendationCard;
