
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StockData, fetchStockData } from "@/services/stockService";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { toast } from "sonner";
import StockDetailView from "./StockDetailView";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Add more popular stocks including Indian and international stocks
const popularStocks = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "META", 
  "TSLA", "NFLX", "NVDA", "BTC-USD", "ETH-USD", 
  "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "TATAMOTORS.NS",
  "WIPRO.NS", "ICICIBANK.NS", "LT.NS", "ADANIENT.NS", "HCLTECH.NS"
];

const LiveStockTracker: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedStocks, setSelectedStocks] = useState(popularStocks.slice(0, 10));
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: stockData, isLoading, error, refetch } = useQuery({
    queryKey: ["stockData", selectedStocks],
    queryFn: () => fetchStockData(selectedStocks),
    refetchInterval: 60000, // Refetch every minute for more reasonable rate
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

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
  };

  const handleBackToList = () => {
    setSelectedStock(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter stocks based on search query
  const filteredStocks = stockData ? stockData.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Default to INR if currency isn't available in userProfile
  const activeCurrency = userProfile?.currency || "INR";

  return (
    <GlassmorphicCard className="mb-8">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-budget-blue" />
              {selectedStock ? `${selectedStock.symbol} Stock Details` : "Live Stock Tracker"}
            </CardTitle>
            <CardDescription>
              {selectedStock 
                ? `Real-time data and charts for ${selectedStock.name}`
                : "Real-time market data for popular stocks"}
            </CardDescription>
          </div>
          {!selectedStock && (
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-8"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(
        "transition-all duration-300", 
        selectedStock ? "max-h-[800px]" : "max-h-[500px] overflow-y-auto pr-1"
      )}>
        {selectedStock ? (
          <StockDetailView stock={selectedStock} onBack={handleBackToList} />
        ) : isLoading ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
              <div 
                key={stock.symbol}
                className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => handleStockClick(stock)}
              >
                <div>
                  <h3 className="font-medium">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(stock.price, activeCurrency)}</p>
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
            )) : (
              <div className="col-span-1 sm:col-span-2 text-center py-6">
                <p>No stocks match your search criteria</p>
              </div>
            )}
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
