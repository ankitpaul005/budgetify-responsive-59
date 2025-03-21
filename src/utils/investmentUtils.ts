
import { format } from "date-fns";
import { Investment } from "./mockData";

// Generate growth data for portfolio projection
export const generateGrowthData = (
  totalValue: number,
  investments: Investment[],
  userIncome?: number
) => {
  const data = [];
  const now = new Date();
  
  // Starting with current total value
  let currentValue = totalValue;
  
  // If no investments, start with a default value based on user income
  if (totalValue === 0 && userIncome) {
    currentValue = userIncome * 0.1; // 10% of annual income as starting investment
  }
  
  // Average annual return rate (weighted by investment value)
  let weightedReturnRate = 10; // Default 10% if no investments
  
  if (totalValue > 0) {
    weightedReturnRate = investments.reduce(
      (sum, inv) => sum + (inv.returnRate * inv.value) / totalValue, 
      0
    );
  }
  
  // Monthly growth rate
  const monthlyRate = weightedReturnRate / 12 / 100;
  
  // Generate data for 24 months (2 years)
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    
    // Compound growth
    currentValue = currentValue * (1 + monthlyRate);
    
    data.push({
      date: format(date, "MMM yyyy"),
      value: Math.round(currentValue),
    });
  }
  
  return data;
};
