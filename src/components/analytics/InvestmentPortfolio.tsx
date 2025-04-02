
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Investment } from '@/utils/mockData';
import { formatCurrency } from '@/utils/formatting';
import { motion } from 'framer-motion';
import { TrendingUp, Landmark, RefreshCw, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { addDays, format } from "date-fns";

interface InvestmentPortfolioProps {
  investments: Investment[];
  currency?: string;
  COLORS: string[];
}

const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({ 
  investments, 
  currency = "INR",
  COLORS 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Calculate total portfolio value and returns
  const totalValue = investments.reduce((total, inv) => total + inv.value, 0);
  const totalInitialValue = investments.reduce((total, inv) => total + inv.initialValue, 0);
  const totalGain = totalValue - totalInitialValue;
  const totalGainPercentage = totalInitialValue > 0 ? (totalGain / totalInitialValue) * 100 : 0;

  // Process data for portfolio composition pie chart
  const portfolioComposition = investments.map((investment, index) => ({
    name: investment.name,
    value: investment.value,
    fill: COLORS[index % COLORS.length],
    initialValue: investment.initialValue,
    gain: investment.value - investment.initialValue,
    gainPercentage: ((investment.value - investment.initialValue) / investment.initialValue) * 100
  }));

  // Generate historical performance data
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = addDays(today, -i);
      // Use a simple variation model to simulate historical data
      const randomFactor = 1 + ((Math.random() * 0.1) - 0.05);
      const value = totalInitialValue * (1 + ((30 - i) / 100)) * randomFactor;
      
      data.push({
        date: format(date, "MMM dd"),
        value: value
      });
    }
    
    // Add current value as the last point
    data.push({
      date: format(today, "MMM dd"),
      value: totalValue
    });
    
    return data;
  };
  
  const historicalData = generateHistoricalData();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // If no investments, show empty state
  if (investments.length === 0) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Landmark className="mr-2 h-5 w-5 text-muted-foreground" />
              Investment Portfolio
            </CardTitle>
            <CardDescription>
              Track your investment performance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Investments Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              It looks like you haven't added any investments yet. Go to the Investments page to start building your portfolio.
            </p>
            <Button onClick={() => window.location.href = '/investments'}>
              Go to Investments
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Investment Portfolio
            </CardTitle>
            <CardDescription>
              Track your investment performance
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>

        <CardContent>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={itemVariants}
          >
            {/* Portfolio summary statistics */}
            <div className="space-y-4">
              <div className="bg-muted/40 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Portfolio Value</div>
                <div className="text-2xl font-bold">{formatCurrency(totalValue, currency)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Gain/Loss</div>
                  <div className={`text-lg font-semibold flex items-center ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, currency)}
                  </div>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Percentage Return</div>
                  <div className={`text-lg font-semibold flex items-center ${totalGainPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGainPercentage >= 0 ? '+' : ''}{totalGainPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio composition pie chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 70 : 90}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {portfolioComposition.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill}
                        stroke="rgba(255,255,255,0.2)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const entry = props.payload;
                      return [
                        <>
                          <div>{formatCurrency(Number(value), currency)}</div>
                          <div className={entry.gain >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {entry.gain >= 0 ? '+' : ''}{formatCurrency(entry.gain, currency)} ({entry.gainPercentage.toFixed(2)}%)
                          </div>
                        </>,
                        entry.name
                      ];
                    }}
                    contentStyle={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"}
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Historical performance chart */}
          <motion.div
            variants={itemVariants}
            className="mt-8 h-64"
          >
            <h3 className="text-md font-semibold mb-4">Portfolio Performance (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value, currency, true)} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value), currency), "Value"]}
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvestmentPortfolio;
