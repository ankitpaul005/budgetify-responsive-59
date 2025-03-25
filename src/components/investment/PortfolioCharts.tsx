
import React from "react";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";
import { Investment } from "@/utils/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export interface PortfolioChartsProps {
  investments: Investment[];
  portfolioComposition: { name: string; value: number }[];
  growthData: any[];
  COLORS: string[];
  currency?: string;
}

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  investments,
  portfolioComposition,
  growthData,
  COLORS,
  currency = "INR",
}) => {
  const isMobile = useIsMobile();
  
  // Helper function to safely convert to number
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // 3D effect card variants
  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    hover: { 
      y: -5, 
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Card className="relative overflow-hidden">
          {/* 3D effect background elements */}
          <div className="absolute -z-10 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl top-20 right-10"></div>
          <div className="absolute -z-10 w-60 h-60 rounded-full bg-green-500/5 blur-3xl bottom-0 left-20"></div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
                Portfolio Growth Projection
              </span>
            </CardTitle>
            <CardDescription>Estimated value over the next 2 years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={growthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="portfolioColorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      interval={isMobile ? 5 : 2}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(toNumber(value), currency)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(toNumber(value), currency), "Projected Value"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0EA5E9" 
                      strokeWidth={3}
                      fill="url(#portfolioColorGrowth)" 
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No growth data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          {/* 3D effect background elements */}
          <div className="absolute -z-10 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl top-10 left-20"></div>
          <div className="absolute -z-10 w-60 h-60 rounded-full bg-amber-500/5 blur-3xl bottom-10 right-10"></div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                Portfolio Composition
              </span>
            </CardTitle>
            <CardDescription>Breakdown of your investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {portfolioComposition.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioComposition}
                      cx="50%"
                      cy="50%"
                      labelLine={!isMobile}
                      label={!isMobile ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : null}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {portfolioComposition.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(toNumber(value), currency), "Amount"]}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                      layout={isMobile ? "horizontal" : "vertical"}
                      verticalAlign={isMobile ? "bottom" : "middle"}
                      align={isMobile ? "center" : "right"}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No investment data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default PortfolioCharts;
