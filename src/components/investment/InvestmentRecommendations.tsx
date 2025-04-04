
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateInvestmentRecommendations } from "@/utils/investmentRecommendationUtils";
import AvailableFundsCard from "./AvailableFundsCard";
import RecommendationsGrid from "./RecommendationsGrid";
import EmptyRecommendations from "./EmptyRecommendations";

interface InvestmentRecommendationsProps {
  availableFunds: number;
  hasIncomeInfo: boolean;
}

const InvestmentRecommendations: React.FC<InvestmentRecommendationsProps> = ({
  availableFunds,
  hasIncomeInfo,
}) => {
  const recommendations = generateInvestmentRecommendations(availableFunds);

  return (
    <div className="mb-8">
      <GlassmorphicCard>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-budget-yellow" />
                Smart Investment Recommendations
              </CardTitle>
              <CardDescription>
                Tailored allocations based on your available funds
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => toast.info("Recommendation feature is being enhanced!")}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasIncomeInfo && availableFunds > 0 ? (
            <div className="space-y-6">
              <AvailableFundsCard availableFunds={availableFunds} />
              <RecommendationsGrid recommendations={recommendations} />
            </div>
          ) : (
            <EmptyRecommendations hasIncomeInfo={hasIncomeInfo} />
          )}
        </CardContent>
      </GlassmorphicCard>
    </div>
  );
};

export default InvestmentRecommendations;
