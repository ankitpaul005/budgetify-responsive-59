
import React from "react";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";
import { Investment } from "@/utils/mockData";

export interface PortfolioChartsProps {
  investments: Investment[];
  portfolioComposition: { name: string; value: number }[];
  growthData: any[];
  COLORS: string[];
  currency?: string; // Added currency prop
}

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  investments,
  portfolioComposition,
  growthData,
  COLORS,
  currency = "INR", // Default to INR
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Growth Projection</CardTitle>
          <CardDescription>Estimated value over the next 2 years</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value, currency)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value, currency), "Projected Value"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0EA5E9" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No growth data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Composition</CardTitle>
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
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
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
    </>
  );
};

export default PortfolioCharts;
