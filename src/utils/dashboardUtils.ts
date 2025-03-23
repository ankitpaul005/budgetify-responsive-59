
import { Transaction } from "@/utils/mockData";

export const calculateSummary = (transactions: Transaction[], userIncome: number = 0) => {
  console.log("Calculating summary with income:", userIncome, "and transactions:", transactions);
  
  if (!transactions || transactions.length === 0) {
    console.log("No transactions found, returning defaults");
    return {
      income: userIncome || 0,
      expenses: 0,
      balance: userIncome || 0,
      savingsRate: 100,
    };
  }
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  console.log("Current month transactions:", currentMonthTransactions.length);
  
  // Calculate total expenses
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  console.log("Total expenses:", expenses);
    
  // Calculate additional income from income transactions
  const additionalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  console.log("Additional income:", additionalIncome);
    
  const totalIncome = (userIncome || 0) + additionalIncome;
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
