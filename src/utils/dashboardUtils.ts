
import { Transaction } from "@/utils/mockData";

export const calculateSummary = (transactions: Transaction[], userIncome: number = 0) => {
  console.log("Calculating summary with income:", userIncome, "and transactions:", transactions);
  
  if (!transactions || transactions.length === 0) {
    console.log("No transactions found, returning defaults");
    return {
      income: userIncome || 0,
      expenses: 0,
      balance: userIncome || 0,
      savingsRate: userIncome ? 100 : 0,
    };
  }
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  console.log("Current month transactions:", currentMonthTransactions.length);
  
  // Calculate total expenses (including investment expenses)
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  console.log("Total expenses:", expenses);
    
  // Calculate additional income from income transactions
  const additionalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  console.log("Additional income:", additionalIncome, "User income:", userIncome);
    
  // Use the exact income value without any currency conversion
  const totalIncome = userIncome + additionalIncome;
  const balance = totalIncome - expenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - expenses) / totalIncome) * 100 : 0;
  
  console.log("Summary result:", { income: totalIncome, expenses, balance, savingsRate });
  
  return {
    income: totalIncome,
    expenses,
    balance,
    savingsRate,
  };
};

// Function to handle stock investments
export const processStockInvestment = async (userId: string, symbol: string, quantity: number, price: number) => {
  try {
    // Create a new expense transaction for the stock purchase
    const investmentAmount = quantity * price;
    const investmentTransaction = {
      user_id: userId,
      description: `Investment in ${symbol} stock (${quantity} shares)`,
      amount: investmentAmount,
      category: "Investments",
      type: "expense",
      date: new Date().toISOString()
    };
    
    // We'll return the transaction data for the caller to add to Supabase
    return {
      transaction: investmentTransaction,
      amount: investmentAmount
    };
  } catch (error) {
    console.error("Error processing stock investment:", error);
    throw error;
  }
};

// Function to handle SIP investments
export const processSIPInvestment = async (userId: string, fundName: string, amount: number) => {
  try {
    // Create a new expense transaction for the SIP investment
    const investmentTransaction = {
      user_id: userId,
      description: `SIP Investment in ${fundName}`,
      amount: amount,
      category: "SIP Investments",
      type: "expense",
      date: new Date().toISOString()
    };
    
    // Return the transaction data for the caller to add to Supabase
    return {
      transaction: investmentTransaction,
      amount: amount
    };
  } catch (error) {
    console.error("Error processing SIP investment:", error);
    throw error;
  }
};

// Group transactions by category for pie charts
export const groupTransactionsByCategory = (transactions: Transaction[]) => {
  // Get all expense transactions
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  // Group by category and sum amounts
  const groupedExpenses = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array format for charts
  return Object.entries(groupedExpenses).map(([name, value]) => ({
    name,
    value
  })).filter(item => item.value > 0);
};

// Process available SIPs from transactions
export const getAvailableSIPs = (transactions: Transaction[]) => {
  const sipTransactions = transactions.filter(t => 
    t.type === 'expense' && 
    (t.category === 'SIP Investments' || t.description.includes('SIP'))
  );
  
  const sipMapping: Record<string, { total: number, count: number, lastDate: string }> = {};
  
  // Group SIPs by fund name
  sipTransactions.forEach(transaction => {
    // Extract fund name from description
    const match = transaction.description.match(/SIP Investment in (.+)/) || 
                 transaction.description.match(/Investment in (.+) SIP/);
    
    const fundName = match ? match[1] : 'Unknown Fund';
    
    if (!sipMapping[fundName]) {
      sipMapping[fundName] = {
        total: 0,
        count: 0,
        lastDate: transaction.date
      };
    }
    
    sipMapping[fundName].total += transaction.amount;
    sipMapping[fundName].count += 1;
    
    // Update last date if this transaction is more recent
    if (new Date(transaction.date) > new Date(sipMapping[fundName].lastDate)) {
      sipMapping[fundName].lastDate = transaction.date;
    }
  });
  
  // Convert to array format
  return Object.entries(sipMapping).map(([fundName, data]) => ({
    fundName,
    totalInvested: data.total,
    numberOfInvestments: data.count,
    averageInvestment: data.total / data.count,
    lastInvestmentDate: data.lastDate
  }));
};
