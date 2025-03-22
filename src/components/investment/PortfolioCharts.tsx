
import React from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, Cell, Pie, Legend } from "recharts";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { Investment } from "@/utils/mockData";

interface PortfolioChartsProps {
  investments: Investment[];
  portfolioComposition: { name: string; value: number }[];
  growthData: { date: string; value: number }[];
  COLORS: string[];
}

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  investments,
  portfolioComposition,
  growthData,
  COLORS,
}) => {
  return (
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
  );
};

export default PortfolioCharts;
