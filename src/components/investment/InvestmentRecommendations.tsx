
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { toast } from "sonner";

interface InvestmentRecommendationsProps {
  availableFunds: number;
  hasIncomeInfo: boolean;
}

const InvestmentRecommendations: React.FC<InvestmentRecommendationsProps> = ({
  availableFunds,
  hasIncomeInfo,
}) => {
  // Generate recommendations based on available funds
  const getRecommendations = () => {
    if (availableFunds <= 0) return [];
    
    const recommendations = [];
    let remainingFunds = availableFunds;
    
    // Emergency fund recommendation (if less than 3 months expenses saved)
    const estimatedMonthlyExpenses = 40000; // Assume average monthly expenses
    const emergencyTarget = estimatedMonthlyExpenses * 3;
    const emergencyAllocation = Math.min(remainingFunds * 0.3, emergencyTarget);
    
    if (emergencyAllocation >= 5000) {
      recommendations.push({
        name: "Emergency Fund",
        description: "High-liquidity savings for unexpected expenses",
        allocation: emergencyAllocation,
        percentage: Math.round((emergencyAllocation / availableFunds) * 100),
        riskLevel: "Very Low",
        returnRate: "4-6%",
        instrument: "High-yield Savings Account",
        priority: "High"
      });
      remainingFunds -= emergencyAllocation;
    }
    
    // SIP recommendations
    if (remainingFunds >= 5000) {
      const sipAllocation = Math.min(remainingFunds * 0.4, 25000);
      recommendations.push({
        name: "SIP Investment",
        description: "Systematic Investment Plan in equity mutual funds",
        allocation: sipAllocation,
        percentage: Math.round((sipAllocation / availableFunds) * 100),
        riskLevel: "Medium",
        returnRate: "10-14%",
        instrument: "HDFC Mid-Cap Opportunities Fund",
        priority: "Medium"
      });
      remainingFunds -= sipAllocation;
    }
    
    // Stock recommendations
    if (remainingFunds >= 10000) {
      const stockAllocation = Math.min(remainingFunds * 0.5, 50000);
      recommendations.push({
        name: "Blue-chip Stocks",
        description: "Diversified portfolio of established companies",
        allocation: stockAllocation,
        percentage: Math.round((stockAllocation / availableFunds) * 100),
        riskLevel: "Medium-High",
        returnRate: "12-18%",
        instrument: "HDFC Bank, Infosys, Reliance",
        priority: "Medium"
      });
      remainingFunds -= stockAllocation;
    }
    
    // Safe investments for remaining funds
    if (remainingFunds >= 1000) {
      recommendations.push({
        name: "Fixed Deposit",
        description: "Fixed term deposit with guaranteed returns",
        allocation: remainingFunds,
        percentage: Math.round((remainingFunds / availableFunds) * 100),
        riskLevel: "Low",
        returnRate: "5-7%",
        instrument: "SBI Fixed Deposit (1 year)",
        priority: "Low"
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();

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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((recommendation, index) => (
                  <div 
                    key={index} 
                    className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                  >
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
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </GlassmorphicCard>
    </div>
  );
};

export default InvestmentRecommendations;
