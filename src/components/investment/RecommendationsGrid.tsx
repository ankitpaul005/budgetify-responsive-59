
import React from "react";
import RecommendationCard from "./RecommendationCard";
import { InvestmentRecommendation } from "@/utils/investmentRecommendationUtils";

interface RecommendationsGridProps {
  recommendations: InvestmentRecommendation[];
}

const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ recommendations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  );
};

export default RecommendationsGrid;
