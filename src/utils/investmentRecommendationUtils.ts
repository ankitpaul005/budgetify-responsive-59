
import { formatCurrency } from "./formatting";

export interface InvestmentRecommendation {
  name: string;
  description: string;
  allocation: number;
  percentage: number;
  riskLevel: string;
  returnRate: string;
  instrument: string;
  priority: string;
}

export const generateInvestmentRecommendations = (availableFunds: number): InvestmentRecommendation[] => {
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
