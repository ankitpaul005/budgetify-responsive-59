
import { Transaction } from "@/utils/mockData";

export const calculateSummary = (transactions: Transaction[], userIncome: number = 0) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  // Calculate total expenses
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate additional income from income transactions
  const additionalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = userIncome + additionalIncome;
  const balance = totalIncome - expenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - expenses) / totalIncome) * 100 : 0;
  
  return {
    income: totalIncome,
    expenses,
    balance,
    savingsRate,
  };
};
