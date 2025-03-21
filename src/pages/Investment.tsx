
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, Line, Cell, Pie, Legend } from "recharts";
import { format, parseISO, differenceInMonths, differenceInDays } from "date-fns";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Investment, getInvestmentSuggestions } from "@/utils/mockData";
import { TrendingUp, TrendingDown, Percent, Calendar, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Format currency in INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
const formatPercent = (percent: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);
};

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
  
  // Prepare data for portfolio growth simulation
  const generateGrowthData = () => {
    const data = [];
    const now = new Date();
    
    // Starting with current total value
    let currentValue = totalValue;
    
    // If no investments, start with a default value based on user income
    if (totalValue === 0 && user?.totalIncome) {
      currentValue = user.totalIncome * 0.1; // 10% of annual income as starting investment
    }
    
    // Average annual return rate (weighted by investment value)
    let weightedReturnRate = 10; // Default 10% if no investments
    
    if (totalValue > 0) {
      weightedReturnRate = investments.reduce(
        (sum, inv) => sum + (inv.returnRate * inv.value) / totalValue, 
        0
      );
    }
    
    // Monthly growth rate
    const monthlyRate = weightedReturnRate / 12 / 100;
    
    // Generate data for 24 months (2 years)
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      
      // Compound growth
      currentValue = currentValue * (1 + monthlyRate);
      
      data.push({
        date: format(date, "MMM yyyy"),
        value: Math.round(currentValue),
      });
    }
    
    return data;
  };
  
  const growthData = generateGrowthData();
  
  // Calculate days since investment started and annualized return
  const calculateInvestmentMetrics = (investment: Investment) => {
    const startDate = new Date(investment.startDate);
    const now = new Date();
    const daysSinceStart = differenceInDays(now, startDate);
    const monthsSinceStart = differenceInMonths(now, startDate);
    
    // Annualized return calculation
    const totalReturn = (investment.value - investment.initialValue) / investment.initialValue;
    const annualizedReturn = monthsSinceStart > 0 
      ? ((1 + totalReturn) ** (12 / monthsSinceStart) - 1) * 100 
      : totalReturn * 100;
    
    return {
      daysSinceStart,
      annualizedReturn: isNaN(annualizedReturn) ? 0 : annualizedReturn,
    };
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Investments</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-blue-light text-budget-blue rounded-full p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Portfolio Value
            </h3>
            <p className="text-3xl font-bold mb-1">{formatCurrency(totalValue)}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Across {investments.length} investments</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-green-light text-budget-green rounded-full p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Total Gain/Loss
            </h3>
            <p className={`text-3xl font-bold mb-1 ${
              totalGain >= 0 ? "text-budget-green" : "text-budget-red"
            }`}>
              {totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)}
            </p>
            <div className="flex items-center text-sm">
              <span className={totalReturnPercent >= 0 ? "text-budget-green" : "text-budget-red"}>
                {totalReturnPercent >= 0 ? "+" : ""}
                {formatPercent(totalReturnPercent)}
              </span>
              <span className="text-muted-foreground ml-1">Total return</span>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-budget-yellow-light text-budget-yellow rounded-full p-2">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Projected Growth
            </h3>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(growthData[growthData.length - 1].value)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Estimated value in 2 years</span>
            </div>
          </GlassmorphicCard>
        </div>
        
        {/* Investment Suggestions */}
        <div className="mb-8">
          <GlassmorphicCard>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personalized Investment Suggestions</CardTitle>
                  <CardDescription>
                    Based on your income profile
                  </CardDescription>
                </div>
                <Info className="text-budget-blue h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {user?.totalIncome ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investmentSuggestions.map((suggestion, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{suggestion.type}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.risk === 'Very Low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          suggestion.risk === 'Low' ? 'bg-budget-green-light text-budget-green' :
                          suggestion.risk === 'Medium' ? 'bg-budget-yellow-light text-budget-yellow' :
                          suggestion.risk === 'Medium-High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-budget-red-light text-budget-red'
                        }`}>
                          {suggestion.risk} Risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>Expected Return:</span>
                        <span className="font-medium text-budget-green">{suggestion.expectedReturn}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span>Min Investment:</span>
                        <span className="font-medium">{suggestion.minAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 px-4 text-center">
                  <div>
                    <AlertTriangle className="h-10 w-10 text-budget-yellow mx-auto mb-2" />
                    <h3 className="text-lg font-medium mb-1">Income Information Required</h3>
                    <p className="text-muted-foreground mb-4">
                      Please update your income information to receive personalized investment suggestions.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </GlassmorphicCard>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
                <TabsTrigger value="projection">Projection</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Portfolio Composition</CardTitle>
                    <CardDescription>
                      Your investment allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {investments.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioComposition}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => 
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {portfolioComposition.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                formatCurrency(value),
                                "Amount",
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <Info className="h-10 w-10 text-budget-blue mx-auto mb-2" />
                            <h3 className="text-lg font-medium mb-1">No Investments Yet</h3>
                            <p className="text-muted-foreground">
                              Add investments to see your portfolio composition
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </TabsContent>
              
              <TabsContent value="allocation" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>
                      Distribution of your investments by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {investments.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                investments.reduce<{ name: string; value: number }[]>((acc, inv) => {
                                  const existing = acc.findIndex(i => i.name === inv.type);
                                  if (existing >= 0) {
                                    acc[existing].value += inv.value;
                                  } else {
                                    acc.push({ name: inv.type, value: inv.value });
                                  }
                                  return acc;
                                }, [])
                              }
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => 
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {portfolioComposition.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                formatCurrency(value),
                                "Amount",
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <Info className="h-10 w-10 text-budget-blue mx-auto mb-2" />
                            <h3 className="text-lg font-medium mb-1">No Investments Yet</h3>
                            <p className="text-muted-foreground">
                              Add investments to see your asset allocation
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </TabsContent>
              
              <TabsContent value="projection" className="space-y-6">
                <GlassmorphicCard>
                  <CardHeader className="pb-2">
                    <CardTitle>Portfolio Projection</CardTitle>
                    <CardDescription>
                      Estimated portfolio growth over the next 2 years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={growthData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(value).replace(',000', 'k')}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Projected Value"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8B5CF6"
                            fill="url(#colorValue)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Investment List */}
          <div className="space-y-8">
            <GlassmorphicCard>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Your Investments</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => toast.info("Add investment feature coming soon!")}
                  >
                    Add New
                  </Button>
                </div>
                <CardDescription>
                  Track and manage your investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {investments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No investments found
                    </div>
                  ) : (
                    investments.map((investment) => {
                      const { daysSinceStart, annualizedReturn } = calculateInvestmentMetrics(investment);
                      const gain = investment.value - investment.initialValue;
                      const returnPercent = (gain / investment.initialValue) * 100;
                      
                      return (
                        <div
                          key={investment.id}
                          className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{investment.name}</h3>
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">
                              {investment.type}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Value</p>
                              <p className="font-medium">{formatCurrency(investment.value)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Initial Investment</p>
                              <p className="font-medium">{formatCurrency(investment.initialValue)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {returnPercent >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-budget-green" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-budget-red" />
                              )}
                              <span className={`text-sm font-medium ${
                                returnPercent >= 0 ? "text-budget-green" : "text-budget-red"
                              }`}>
                                {returnPercent >= 0 ? "+" : ""}
                                {formatPercent(returnPercent)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                ({gain >= 0 ? "+" : ""}{formatCurrency(gain)})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>{daysSinceStart} days</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentPage;
