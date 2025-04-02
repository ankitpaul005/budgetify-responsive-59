
import { Transaction, Category } from "@/utils/mockData";

export const categorizeTransactions = (
  transactions: Transaction[],
  categories: Category[]
) => {
  return transactions.map((transaction) => {
    const matchingCategory = categories.find(
      (cat) => cat.id === transaction.category
    );
    return {
      ...transaction,
      categoryName: matchingCategory ? matchingCategory.name : "Uncategorized",
    };
  });
};

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groupedData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((transaction) => {
    // Format date as a key (e.g. "Jan 2023")
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;

    // Initialize if not exists
    if (!groupedData[key]) {
      groupedData[key] = { income: 0, expense: 0 };
    }

    // Add to the right category
    if (transaction.type === 'income') {
      groupedData[key].income += transaction.amount;
    } else {
      groupedData[key].expense += transaction.amount;
    }
  });

  return groupedData;
};
