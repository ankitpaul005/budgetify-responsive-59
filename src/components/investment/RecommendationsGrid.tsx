
import React from "react";
import { InvestmentRecommendation } from "@/utils/investmentRecommendationUtils";
import RecommendationCard from "./RecommendationCard";

interface RecommendationsGridProps {
  recommendations: InvestmentRecommendation[];
  currency?: string; // Add currency prop
}

const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ 
  recommendations, 
  currency = "INR" // Default to INR
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} currency={currency} />
      ))}
    </div>
  );
};

export default RecommendationsGrid;
