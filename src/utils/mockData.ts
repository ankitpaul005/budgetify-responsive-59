
// Types
export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  date: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
};

export type Budget = {
  id: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  categories: { categoryId: string; limit: number }[];
};

export type Investment = {
  id: string;
  name: string;
  value: number;
  initialValue: number;
  returnRate: number;
  startDate: string;
  type: string;
}

export type InvestmentSuggestion = {
  type: string;
  description: string;
  expectedReturn: string;
  risk: "Very Low" | "Low" | "Medium" | "Medium-High" | "High";
  minAmount: string;
}

// Mock Categories
export const defaultCategories: Category[] = [
  {
    id: "cat-1",
    name: "Housing",
    color: "budget-blue",
    icon: "home",
    budget: 1500,
  },
  {
    id: "cat-2",
    name: "Food",
    color: "budget-green",
    icon: "utensils",
    budget: 500,
  },
  {
    id: "cat-3",
    name: "Transportation",
    color: "budget-yellow",
    icon: "car",
    budget: 250,
  },
  {
    id: "cat-4",
    name: "Entertainment",
    color: "budget-purple",
    icon: "film",
    budget: 200,
  },
  {
    id: "cat-5",
    name: "Shopping",
    color: "budget-red",
    icon: "shopping-bag",
    budget: 300,
  },
  {
    id: "cat-6",
    name: "Utilities",
    color: "budget-gray",
    icon: "bolt",
    budget: 180,
  },
  {
    id: "cat-7",
    name: "Salary",
    color: "budget-green",
    icon: "briefcase",
  },
  {
    id: "cat-8",
    name: "Investment",
    color: "budget-purple",
    icon: "chart-line",
  },
];

// Function to generate investment suggestions based on user balance
export const getInvestmentSuggestions = (monthlyIncome: number): InvestmentSuggestion[] => {
  const suggestions: InvestmentSuggestion[] = [];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Conservative investment (for lower income)
  if (monthlyIncome < 50000) {
    suggestions.push({
      type: "Bank Fixed Deposit",
      description: "Safe investment with guaranteed returns",
      expectedReturn: "5-7%",
      risk: "Low",
      minAmount: formatCurrency(5000)
    });
    suggestions.push({
      type: "Post Office Monthly Income Scheme",
      description: "Government backed savings scheme",
      expectedReturn: "6.7%",
      risk: "Very Low",
      minAmount: formatCurrency(1000)
    });
    suggestions.push({
      type: "SBI Small Cap Fund SIP",
      description: "Monthly investment in small cap mutual fund",
      expectedReturn: "12-15%",
      risk: "Medium-High",
      minAmount: formatCurrency(500)
    });
  }
  
  // Moderate investments (for medium income)
  if (monthlyIncome >= 50000 && monthlyIncome < 100000) {
    suggestions.push({
      type: "Nifty 50 Index Fund",
      description: "Passive investment tracking market indices",
      expectedReturn: "10-12%",
      risk: "Medium",
      minAmount: formatCurrency(5000)
    });
    suggestions.push({
      type: "Government Bonds",
      description: "Safe government-backed securities",
      expectedReturn: "7-8%",
      risk: "Low",
      minAmount: formatCurrency(10000)
    });
    suggestions.push({
      type: "Parag Parikh Flexi Cap Fund SIP",
      description: "Monthly investment in diversified equity fund",
      expectedReturn: "12-14%",
      risk: "Medium",
      minAmount: formatCurrency(1000)
    });
    suggestions.push({
      type: "Blue Chip Stocks",
      description: "HDFC Bank, Reliance, TCS shares",
      expectedReturn: "12-15%",
      risk: "Medium",
      minAmount: formatCurrency(10000)
    });
  }
  
  // Aggressive investments (for higher income)
  if (monthlyIncome >= 100000) {
    suggestions.push({
      type: "Mirae Asset Emerging Bluechip Fund",
      description: "Actively managed equity fund",
      expectedReturn: "15-18%",
      risk: "Medium-High",
      minAmount: formatCurrency(2500)
    });
    suggestions.push({
      type: "Real Estate Investment",
      description: "Property investment for long-term growth",
      expectedReturn: "8-12%",
      risk: "Medium",
      minAmount: formatCurrency(500000)
    });
    suggestions.push({
      type: "Growth Stocks",
      description: "InfoEdge, Dixon Tech, Bajaj Finance shares",
      expectedReturn: "15-20%",
      risk: "High",
      minAmount: formatCurrency(25000)
    });
    suggestions.push({
      type: "ICICI Prudential Technology Fund",
      description: "Sectoral fund focused on technology stocks",
      expectedReturn: "16-20%",
      risk: "High",
      minAmount: formatCurrency(5000)
    });
  }
  
  // Suggestions for all income levels
  suggestions.push({
    type: "Emergency Fund",
    description: "3-6 months of expenses in high-liquidity investments",
    expectedReturn: "4-5%",
    risk: "Very Low",
    minAmount: formatCurrency(monthlyIncome * 3)
  });
  
  suggestions.push({
    type: "Gold ETF SIP",
    description: "Monthly investment in Gold ETF",
    expectedReturn: "8-10%",
    risk: "Medium",
    minAmount: formatCurrency(1000)
  });
  
  return suggestions;
};

// Function to initialize user data
export const initializeUserData = (userId: string) => {
  // Check if data already exists
  const existingTransactions = localStorage.getItem(`budgetify-transactions-${userId}`);
  const existingCategories = localStorage.getItem(`budgetify-categories-${userId}`);
  const existingBudget = localStorage.getItem(`budgetify-budget-${userId}`);
  const existingInvestments = localStorage.getItem(`budgetify-investments-${userId}`);
  
  // Initialize only if data doesn't exist
  if (!existingTransactions) {
    localStorage.setItem(
      `budgetify-transactions-${userId}`,
      JSON.stringify([])
    );
  }
  
  if (!existingCategories) {
    localStorage.setItem(
      `budgetify-categories-${userId}`,
      JSON.stringify(defaultCategories)
    );
  }
  
  if (!existingBudget) {
    localStorage.setItem(
      `budgetify-budget-${userId}`,
      JSON.stringify({
        id: "budget-1",
        amount: 0,
        period: "monthly",
        startDate: new Date().toISOString(),
        categories: defaultCategories
          .filter(cat => cat.budget)
          .map(cat => ({ categoryId: cat.id, limit: cat.budget || 0 }))
      })
    );
  }
  
  if (!existingInvestments) {
    localStorage.setItem(
      `budgetify-investments-${userId}`,
      JSON.stringify([])
    );
  }
};
