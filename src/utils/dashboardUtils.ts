
import { Transaction } from "@/utils/mockData";

export const calculateSummary = (transactions: Transaction[], userIncome: number = 0) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= startOfMonth
  );
  
  const expenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = userIncome - expenses;
  const savingsRate = userIncome > 0 ? ((userIncome - expenses) / userIncome) * 100 : 0;
  
  return {
    income: userIncome,
    expenses,
    balance,
    savingsRate,
  };
};
