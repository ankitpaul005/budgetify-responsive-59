
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { StockData, StockHistoricalData, fetchStockHistoricalData } from "@/services/stockService";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { ActivityTypes, logActivity } from "@/services/activityService";
import useLocalStorage from "@/hooks/useLocalStorage";
import { toast } from "sonner";

interface StockDetailViewProps {
  stock: StockData;
  onBack: () => void;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ stock, onBack }) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [investmentDialog, setInvestmentDialog] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<string>("1");
  const [investments, setInvestments] = useLocalStorage<any[]>(
    `budgetify-investments-${user?.id || "demo"}`,
    []
  );

  // Fetch historical data
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["stockHistorical", stock.symbol, timeframe],
    queryFn: () => fetchStockHistoricalData(stock.symbol, timeframe),
    refetchInterval: 60000, // Refresh every minute
  });

  // Format data for chart
  const chartData = historicalData?.map((item: StockHistoricalData) => ({
    date: new Date(item.date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    value: item.close,
  })) || [];

  // Calculate performance
  const firstPrice = chartData[0]?.value || 0;
  const lastPrice = chartData[chartData.length - 1]?.value || stock.price;
  const performancePercent = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isPositive = performancePercent >= 0;

  // Chart colors
  const chartColor = isPositive ? "#10B981" : "#EF4444";

  // Handle investment
  const handleInvest = () => {
    try {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error("Please enter a valid quantity");
        return;
      }

      const totalAmount = qty * stock.price;

      // Create new investment
      const newInvestment = {
        id: uuidv4(),
        name: `${stock.symbol} Stock`,
        value: totalAmount,
        initialValue: totalAmount,
        returnRate: 10, // Assumed annual return rate
        type: "Stocks",
        startDate: new Date().toISOString(),
        symbol: stock.symbol,
        quantity: qty,
        price: stock.price
      };

      // Log activity
      if (user) {
        logActivity(
          user.id,
          ActivityTypes.INVESTMENT,
          `Purchased ${qty} shares of ${stock.symbol} for ${formatCurrency(totalAmount)}`
        );
      }

      // Add to investments
      setInvestments([newInvestment, ...investments]);
      
      // Close dialog and notify
      setInvestmentDialog(false);
      setQuantity("1");
      toast.success(`Successfully invested in ${stock.symbol}!`);
    } catch (error) {
      console.error("Error investing:", error);
      toast.error("Failed to complete investment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-bold">{stock.name} ({stock.symbol})</h2>
      </div>

      {/* Stock summary card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">
                {formatCurrency(stock.price)}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                {stock.changePercent >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-budget-green mr-1" />
                    <span className="text-budget-green font-medium">
                      +{formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-budget-red mr-1" />
                    <span className="text-budget-red font-medium">
                      {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-2">Today</span>
              </CardDescription>
            </div>
            <Button onClick={() => setInvestmentDialog(true)}>
              Invest Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Volume</p>
              <p className="font-medium">{stock.volume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatCurrency(stock.marketCap)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(stock.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">52-Week Range</p>
              <p className="font-medium">{formatCurrency(stock.price * 0.8)} - {formatCurrency(stock.price * 1.2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <Tabs defaultValue="1D" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-xs">
              <TabsTrigger value="1D" onClick={() => setTimeframe("1D")}>1D</TabsTrigger>
              <TabsTrigger value="5D" onClick={() => setTimeframe("5D")}>5D</TabsTrigger>
              <TabsTrigger value="1M" onClick={() => setTimeframe("1M")}>1M</TabsTrigger>
              <TabsTrigger value="1Y" onClick={() => setTimeframe("1Y")}>1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded shadow p-2 text-sm">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p className="font-medium text-primary">
                              {formatCurrency(Number(payload[0].value))}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Dialog */}
      <Dialog open={investmentDialog} onOpenChange={setInvestmentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invest in {stock.symbol}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label htmlFor="quantity">Number of Shares</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-medium">{formatCurrency(stock.price)} per share</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="font-bold text-lg">
                  {formatCurrency(parseFloat(quantity || "0") * stock.price)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvestmentDialog(false)}>Cancel</Button>
            <Button onClick={handleInvest}>Confirm Investment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDetailView;
