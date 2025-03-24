
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StockData, fetchStockData } from "@/services/stockService";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { toast } from "sonner";

const popularStocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NFLX", "NVDA"];

const LiveStockTracker: React.FC = () => {
  const [selectedStocks, setSelectedStocks] = useState(popularStocks.slice(0, 5));
  
  const { data: stockData, isLoading, error, refetch } = useQuery({
    queryKey: ["stockData", selectedStocks],
    queryFn: () => fetchStockData(selectedStocks),
    refetchInterval: 60000, // Refetch every minute
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch stock data");
      console.error("Stock data error:", error);
    }
  }, [error]);

  const handleRefresh = () => {
    toast.info("Refreshing stock data...");
    refetch();
  };

  return (
    <GlassmorphicCard className="mb-8">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-budget-blue" />
              Live Stock Tracker
            </CardTitle>
            <CardDescription>
              Real-time market data for popular stocks
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center p-3 border border-border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : stockData && stockData.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {stockData.map((stock) => (
              <div 
                key={stock.symbol}
                className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(stock.price)}</p>
                  <div className="flex items-center justify-end gap-1">
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-budget-green" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-budget-red" />
                    )}
                    <span className={`text-xs ${
                      stock.changePercent >= 0 ? "text-budget-green" : "text-budget-red"
                    }`}>
                      {stock.changePercent >= 0 ? "+" : ""}
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p>No stock data available</p>
          </div>
        )}
      </CardContent>
    </GlassmorphicCard>
  );
};

export default LiveStockTracker;
