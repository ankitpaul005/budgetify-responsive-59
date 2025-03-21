
import React from "react";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { InvestmentSuggestion } from "@/utils/mockData";

interface InvestmentSuggestionsProps {
  investmentSuggestions: InvestmentSuggestion[];
  hasIncomeInfo: boolean;
}

const InvestmentSuggestions: React.FC<InvestmentSuggestionsProps> = ({
  investmentSuggestions,
  hasIncomeInfo,
}) => {
  return (
    <div className="mb-8">
      <GlassmorphicCard>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Personalized Investment Suggestions</CardTitle>
              <CardDescription>
                Based on your income profile
              </CardDescription>
            </div>
            <Info className="text-budget-blue h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          {hasIncomeInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investmentSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{suggestion.type}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.risk === 'Very Low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      suggestion.risk === 'Low' ? 'bg-budget-green-light text-budget-green' :
                      suggestion.risk === 'Medium' ? 'bg-budget-yellow-light text-budget-yellow' :
                      suggestion.risk === 'Medium-High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-budget-red-light text-budget-red'
                    }`}>
                      {suggestion.risk} Risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>Expected Return:</span>
                    <span className="font-medium text-budget-green">{suggestion.expectedReturn}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Min Investment:</span>
                    <span className="font-medium">{suggestion.minAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 px-4 text-center">
              <div>
                <AlertTriangle className="h-10 w-10 text-budget-yellow mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">Income Information Required</h3>
                <p className="text-muted-foreground mb-4">
                  Please update your income information to receive personalized investment suggestions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </GlassmorphicCard>
    </div>
  );
};

export default InvestmentSuggestions;
