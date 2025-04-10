
import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const SplitExpenses = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to split expenses with friends</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Split Expenses
            </h1>
            <p className="text-muted-foreground">
              Split bills with friends and track who owes what
            </p>
          </div>
        </div>
        
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="mt-4 text-lg font-medium">Split Expenses Coming Soon</h3>
          <p className="text-muted-foreground mt-2">This feature is being developed.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SplitExpenses;
