
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { Transaction, Category } from "@/utils/mockData";
import { format } from "date-fns";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
}) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <GlassmorphicCard>
      <CardHeader className="pb-2">
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your latest financial activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No transactions yet. Add your first one!
            </p>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 transition-colors border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "expense" 
                      ? "bg-budget-red-light text-budget-red" 
                      : "bg-budget-green-light text-budget-green"
                  }`}>
                    {transaction.type === "expense" ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm md:text-base">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryName(transaction.category)} • {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold text-sm md:text-base tabular-nums ${
                  transaction.type === "expense" ? "text-budget-red" : "text-budget-green"
                }`}>
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default RecentTransactions;
