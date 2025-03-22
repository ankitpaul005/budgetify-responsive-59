
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Investment, getInvestmentSuggestions } from "@/utils/mockData";
import { generateGrowthData } from "@/utils/investmentUtils";

// Import refactored components
import InvestmentSummaryCards from "@/components/investment/InvestmentSummaryCards";
import InvestmentSuggestions from "@/components/investment/InvestmentSuggestions";
import InvestmentRecommendations from "@/components/investment/InvestmentRecommendations";
import PortfolioCharts from "@/components/investment/PortfolioCharts";
import InvestmentList from "@/components/investment/InvestmentList";

const InvestmentPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [investments] = useLocalStorage<Investment[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Get investment suggestions based on user income
  const investmentSuggestions = user?.totalIncome 
    ? getInvestmentSuggestions(user.totalIncome / 12) 
    : [];
  
  // Calculate total portfolio value
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalInitialValue = investments.reduce((sum, inv) => sum + inv.initialValue, 0);
  const totalGain = totalValue - totalInitialValue;
  const totalReturnPercent = totalInitialValue > 0 
    ? ((totalValue - totalInitialValue) / totalInitialValue) * 100 
    : 0;
  
  // Prepare data for portfolio composition chart
  const portfolioComposition = investments.map((investment) => ({
    name: investment.name,
    value: investment.value,
  }));
  
  // Colors for charts
  const COLORS = [
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6B7280",
    "#14B8A6",
  ];
  
  // Generate growth data for portfolio projection
  const growthData = generateGrowthData(
    totalValue,
    investments,
    user?.totalIncome
  );

  // Calculate available funds (10% of user income if present, or estimated value)
  const monthlyIncome = user?.totalIncome ? user.totalIncome / 12 : 0;
  const availableFunds = monthlyIncome * 0.1; // 10% of monthly income for investment

  return (
    <Layout>
      <div className="max-w-7xl mx-auto text-left">
        <h1 className="text-3xl font-bold mb-6">Investments</h1>
        
        {/* Summary Cards */}
        <InvestmentSummaryCards
          totalValue={totalValue}
          totalGain={totalGain}
          totalReturnPercent={totalReturnPercent}
          investments={investments}
          projectedValue={growthData[growthData.length - 1]?.value || 0}
        />
        
        {/* Smart Investment Recommendations */}
        <InvestmentRecommendations
          availableFunds={availableFunds}
          hasIncomeInfo={!!user?.totalIncome}
        />
        
        {/* Investment Suggestions */}
        <InvestmentSuggestions
          investmentSuggestions={investmentSuggestions}
          hasIncomeInfo={!!user?.totalIncome}
        />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            <PortfolioCharts
              investments={investments}
              portfolioComposition={portfolioComposition}
              growthData={growthData}
              COLORS={COLORS}
            />
          </div>
          
          {/* Right Column - Investment List */}
          <div className="space-y-8">
            <InvestmentList
              investments={investments}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentPage;
