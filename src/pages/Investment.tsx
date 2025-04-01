
import React, { useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Investment, getInvestmentSuggestions } from "@/utils/mockData";
import { generateGrowthData } from "@/utils/investmentUtils";
import { ActivityTypes, logActivity } from "@/services/activityService";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Import refactored components
import InvestmentSummaryCards from "@/components/investment/InvestmentSummaryCards";
import InvestmentSuggestions from "@/components/investment/InvestmentSuggestions";
import InvestmentRecommendations from "@/components/investment/InvestmentRecommendations";
import InvestmentList from "@/components/investment/InvestmentList";

// Import new components
import LiveStockTracker from "@/components/investment/LiveStockTracker";
import BitcoinTracker from "@/components/investment/BitcoinTracker";
import SIPTracker from "@/components/investment/SIPTracker";
import SimpleInvestmentForm from "@/components/investment/SimpleInvestmentForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader, RefreshCw } from "lucide-react";
import { fetchLiveExchangeRates } from "@/utils/formatting";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InvestmentPage = () => {
  const { isAuthenticated, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [investments] = useLocalStorage<Investment[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );
  
  const [activeCurrency, setActiveCurrency] = useState("INR");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch live exchange rates
  const { data: liveRates, isLoading: isLoadingRates, refetch: refetchRates } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchLiveExchangeRates,
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refresh every minute
  });
  
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
  const investmentSuggestions = userProfile?.total_income 
    ? getInvestmentSuggestions(userProfile.total_income / 12) 
    : [];
  
  // Calculate total portfolio value
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalInitialValue = investments.reduce((sum, inv) => sum + inv.initialValue, 0);
  const totalGain = totalValue - totalInitialValue;
  const totalReturnPercent = totalInitialValue > 0 
    ? ((totalValue - totalInitialValue) / totalInitialValue) * 100 
    : 0;
  
  // Generate growth data for portfolio projection
  const growthData = generateGrowthData(
    totalValue,
    investments,
    userProfile?.total_income
  );

  // Calculate available funds (10% of user income if present, or estimated value)
  const monthlyIncome = userProfile?.total_income ? userProfile.total_income / 12 : 0;
  const availableFunds = monthlyIncome * 0.1; // 10% of monthly income for investment

  const handleCurrencyChange = (currency: string) => {
    setActiveCurrency(currency);
  };
  
  // Refresh exchange rates
  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      await refetchRates();
      toast.success("Exchange rates refreshed");
    } catch (error) {
      toast.error("Failed to refresh exchange rates");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 text-left relative">
        {/* Enhanced animated background with 3D parallax effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"></div>
          <motion.div 
            className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-purple-200/30 to-transparent blur-3xl dark:from-purple-900/20"
            animate={{ 
              y: [0, 10, 0], 
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.5, 0.4] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <motion.div 
            className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-teal-200/30 to-transparent blur-3xl dark:from-teal-900/20"
            animate={{ 
              y: [0, -10, 0], 
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.5, 0.4] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          ></motion.div>
        </div>
        
        <motion.div 
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green mb-2 sm:mb-0">Investments</h1>
            
            <div className="flex items-center gap-2">
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
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleRefreshRates} 
                  disabled={isRefreshing}
                >
                  <Refresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {isLoadingRates ? (
                <span className="text-xs text-muted-foreground">Loading rates...</span>
              ) : liveRates ? (
                <span className="text-xs text-muted-foreground">Rates updated</span>
              ) : null}
            </div>
          </motion.div>
          
          {/* Summary Cards with motion */}
          <motion.div variants={itemVariants}>
            <InvestmentSummaryCards
              totalValue={totalValue}
              totalGain={totalGain}
              totalReturnPercent={totalReturnPercent}
              investments={investments}
              projectedValue={growthData[growthData.length - 1]?.value || 0}
              currency={activeCurrency}
            />
          </motion.div>
          
          {/* Featured Bitcoin Tracker (Crypto Graph) */}
          <motion.div variants={itemVariants}>
            <BitcoinTracker />
          </motion.div>
          
          {/* Live Stock Tracker */}
          <Suspense fallback={
            <div className="h-60 flex items-center justify-center">
              <Loader className="animate-spin h-8 w-8 text-primary/60" />
            </div>
          }>
            <motion.div variants={itemVariants}>
              <LiveStockTracker />
            </motion.div>
          </Suspense>
          
          {/* SIP Investment Tracker */}
          <Suspense fallback={
            <div className="h-60 flex items-center justify-center">
              <Loader className="animate-spin h-8 w-8 text-primary/60" />
            </div>
          }>
            <motion.div variants={itemVariants}>
              <SIPTracker />
            </motion.div>
          </Suspense>
          
          {/* Main Content Grid - Responsive layout */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
            variants={itemVariants}
          >
            {/* Left Column - Simple Investment Form */}
            <div className="lg:col-span-2">
              <SimpleInvestmentForm />
            </div>
            
            {/* Right Column - Investment List */}
            <div>
              <InvestmentList
                investments={investments}
                currency={activeCurrency}
              />
            </div>
          </motion.div>
          
          {/* Smart Investment Recommendations */}
          <motion.div variants={itemVariants}>
            <InvestmentRecommendations
              availableFunds={availableFunds}
              hasIncomeInfo={!!userProfile?.total_income}
              currency={activeCurrency}
            />
          </motion.div>
          
          {/* Investment Suggestions - Mobile optimized */}
          <motion.div variants={itemVariants}>
            <InvestmentSuggestions
              investmentSuggestions={investmentSuggestions}
              hasIncomeInfo={!!userProfile?.total_income}
              currency={activeCurrency}
            />
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default InvestmentPage;
