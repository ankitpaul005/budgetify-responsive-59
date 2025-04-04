
import React from "react";
import RecommendationCard from "./RecommendationCard";
import { InvestmentRecommendation } from "@/utils/investmentRecommendationUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecommendationsGridProps {
  recommendations: InvestmentRecommendation[];
}

const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ recommendations }) => {
  const isMobile = useIsMobile();
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No recommendations available.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.slice(0, isMobile ? 2 : undefined).map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  );
};

export default RecommendationsGrid;
