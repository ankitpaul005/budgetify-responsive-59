
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

// Function to generate a month of random transactions
export const generateMockTransactions = (userId: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Add income
  transactions.push({
    id: crypto.randomUUID(),
    amount: 4200,
    description: "Monthly Salary",
    category: "cat-7",
    type: "income",
    date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
  });
  
  // Add some random expenses
  const expenseDescriptions = [
    "Rent payment",
    "Grocery shopping",
    "Gas station",
    "Netflix subscription",
    "Electricity bill",
    "Water bill",
    "Internet bill",
    "Mobile phone bill",
    "Restaurant dinner",
    "Coffee shop",
    "Movie tickets",
    "Online shopping",
    "Pharmacy",
    "Gym membership",
  ];
  
  const expenseCategories = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6"];
  
  // Generate 20-30 transactions for the month
  const numTransactions = Math.floor(Math.random() * 10) + 20;
  
  for (let i = 0; i < numTransactions; i++) {
    const date = new Date(
      startOfMonth.getTime() + Math.random() * (today.getTime() - startOfMonth.getTime())
    );
    
    const categoryIndex = Math.floor(Math.random() * expenseCategories.length);
    const descIndex = Math.floor(Math.random() * expenseDescriptions.length);
    
    const amount = parseFloat((Math.random() * 200 + 10).toFixed(2));
    
    transactions.push({
      id: crypto.randomUUID(),
      amount: amount,
      description: expenseDescriptions[descIndex],
      category: expenseCategories[categoryIndex],
      type: "expense",
      date: date.toISOString(),
    });
  }
  
  // Sort by date
  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Function to generate mock investments
export const generateMockInvestments = (userId: string): Investment[] => {
  return [
    {
      id: "inv-1",
      name: "Stock Portfolio",
      value: 12500,
      initialValue: 10000,
      returnRate: 8.5,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
      type: "Stocks",
    },
    {
      id: "inv-2",
      name: "Retirement Fund",
      value: 35000,
      initialValue: 30000,
      returnRate: 5.2,
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString(),
      type: "401k",
    },
    {
      id: "inv-3",
      name: "High-Yield Savings",
      value: 7000,
      initialValue: 6500,
      returnRate: 2.8,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 9)).toISOString(),
      type: "Savings",
    },
    {
      id: "inv-4",
      name: "Tech ETF",
      value: 4200,
      initialValue: 4000,
      returnRate: 12.3,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      type: "ETF",
    },
  ];
};

// Default budget
export const defaultBudget: Budget = {
  id: "budget-1",
  amount: 3000,
  period: "monthly",
  startDate: new Date().toISOString(),
  categories: [
    { categoryId: "cat-1", limit: 1500 },
    { categoryId: "cat-2", limit: 500 },
    { categoryId: "cat-3", limit: 250 },
    { categoryId: "cat-4", limit: 200 },
    { categoryId: "cat-5", limit: 300 },
    { categoryId: "cat-6", limit: 180 },
  ],
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
      JSON.stringify(generateMockTransactions(userId))
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
      JSON.stringify(defaultBudget)
    );
  }
  
  if (!existingInvestments) {
    localStorage.setItem(
      `budgetify-investments-${userId}`,
      JSON.stringify(generateMockInvestments(userId))
    );
  }
};
