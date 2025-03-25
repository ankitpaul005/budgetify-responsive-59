
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Investment, getInvestmentSuggestions } from "@/utils/mockData";
import { generateGrowthData } from "@/utils/investmentUtils";
import { ActivityTypes, logActivity } from "@/services/activityService";

// Import refactored components
import InvestmentSummaryCards from "@/components/investment/InvestmentSummaryCards";
import InvestmentSuggestions from "@/components/investment/InvestmentSuggestions";
import InvestmentRecommendations from "@/components/investment/InvestmentRecommendations";
import PortfolioCharts from "@/components/investment/PortfolioCharts";
import InvestmentList from "@/components/investment/InvestmentList";

// Import new components
import LiveStockTracker from "@/components/investment/LiveStockTracker";
import AIInvestmentAdvisor from "@/components/investment/AIInvestmentAdvisor";
import PortfolioRebalancer from "@/components/investment/PortfolioRebalancer";
import BitcoinTracker from "@/components/investment/BitcoinTracker";
import SIPTracker from "@/components/investment/SIPTracker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const InvestmentPage = () => {
  const { isAuthenticated, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [investments] = useLocalStorage<Investment[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );
  
  const [activeCurrency, setActiveCurrency] = useState("INR");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      // Log activity when visiting the page
      logActivity(
        user.id,
        ActivityTypes.INVESTMENT,
        "Viewed investment page"
      );
    }
  }, [isAuthenticated, navigate, user]);
  
  // Get investment suggestions based on user income
  const investmentSuggestions = userProfile?.totalIncome 
    ? getInvestmentSuggestions(userProfile.totalIncome / 12) 
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
    userProfile?.totalIncome
  );

  // Calculate available funds (10% of user income if present, or estimated value)
  const monthlyIncome = userProfile?.totalIncome ? userProfile.totalIncome / 12 : 0;
  const availableFunds = monthlyIncome * 0.1; // 10% of monthly income for investment

  const handleCurrencyChange = (currency: string) => {
    setActiveCurrency(currency);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 text-left relative">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"></div>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 dark:to-transparent"></div>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-100 to-transparent opacity-50 blur-3xl dark:from-purple-900/30"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-100 to-transparent opacity-50 blur-3xl dark:from-teal-900/30"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green">Investments</h1>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="currency" className="hidden sm:inline text-sm">Currency:</Label>
              <Select defaultValue={activeCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                  <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
                  <SelectItem value="AED">UAE Dirham (د.إ)</SelectItem>
                  <SelectItem value="CNY">Chinese Yuan (¥)</SelectItem>
                  <SelectItem value="BTC">Bitcoin (₿)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <InvestmentSummaryCards
            totalValue={totalValue}
            totalGain={totalGain}
            totalReturnPercent={totalReturnPercent}
            investments={investments}
            projectedValue={growthData[growthData.length - 1]?.value || 0}
            currency={activeCurrency}
          />
          
          {/* Bitcoin Tracker */}
          <BitcoinTracker />
          
          {/* SIP Tracker */}
          <SIPTracker />
          
          {/* Live Stock Tracker */}
          <LiveStockTracker />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - AI Advisor */}
            <div className="lg:col-span-2">
              <AIInvestmentAdvisor />
            </div>
            
            {/* Right Column - Portfolio Rebalancer */}
            <div>
              <PortfolioRebalancer />
            </div>
          </div>
          
          {/* Smart Investment Recommendations */}
          <InvestmentRecommendations
            availableFunds={availableFunds}
            hasIncomeInfo={!!userProfile?.totalIncome}
            currency={activeCurrency}
          />
          
          {/* Investment Suggestions */}
          <InvestmentSuggestions
            investmentSuggestions={investmentSuggestions}
            hasIncomeInfo={!!userProfile?.totalIncome}
            currency={activeCurrency}
          />
          
          {/* Lower Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              <PortfolioCharts
                investments={investments}
                portfolioComposition={portfolioComposition}
                growthData={growthData}
                COLORS={COLORS}
                currency={activeCurrency}
              />
            </div>
            
            {/* Right Column - Investment List */}
            <div className="space-y-8">
              <InvestmentList
                investments={investments}
                currency={activeCurrency}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentPage;
