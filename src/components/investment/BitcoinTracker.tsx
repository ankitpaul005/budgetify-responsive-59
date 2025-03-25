
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StockData } from "@/services/stockService";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bitcoin, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatPercent } from "@/utils/formatting";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Mock function to fetch crypto data
const fetchCryptoData = async (): Promise<StockData[]> => {
  // In a real implementation, this would call an API
  // For now, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          symbol: "BTC-USD",
          name: "Bitcoin",
          price: 66500,
          change: 1250,
          changePercent: 1.92,
          volume: 28500000000,
          marketCap: 1308000000000,
          pe: 0,
          eps: 0,
          high52: 73750,
          low52: 24950,
        },
        {
          symbol: "ETH-USD",
          name: "Ethereum",
          price: 3490,
          change: 45,
          changePercent: 1.31,
          volume: 14700000000,
          marketCap: 419000000000,
          pe: 0,
          eps: 0,
          high52: 4090,
          low52: 1560,
        },
        {
          symbol: "SOL-USD",
          name: "Solana",
          price: 142,
          change: -3.5,
          changePercent: -2.4,
          volume: 2800000000,
          marketCap: 61000000000,
          pe: 0,
          eps: 0,
          high52: 188,
          low52: 18.5,
        },
        {
          symbol: "XRP-USD",
          name: "XRP",
          price: 0.58,
          change: 0.015,
          changePercent: 2.65,
          volume: 1540000000,
          marketCap: 32000000000,
          pe: 0,
          eps: 0,
          high52: 0.95,
          low52: 0.42,
        },
      ]);
    }, 800);
  });
};

const BitcoinTracker: React.FC = () => {
  const { userProfile } = useAuth();
  const currency = userProfile?.currency || "INR";
  
  const { data: cryptoData, isLoading, error } = useQuery({
    queryKey: ["cryptoData"],
    queryFn: fetchCryptoData,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to fetch cryptocurrency data");
      console.error("Crypto data error:", error);
    }
  }, [error]);

  return (
    <GlassmorphicCard className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5 text-budget-yellow" />
          Cryptocurrency Tracker
        </CardTitle>
        <CardDescription>
          Real-time prices and trends for popular cryptocurrencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-3" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : cryptoData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptoData.map((crypto) => (
              <div key={crypto.symbol} className="bg-muted/30 rounded-lg p-4 border border-border hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{crypto.name}</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(crypto.price, currency)}</p>
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                    crypto.changePercent >= 0 ? "bg-budget-green/10 text-budget-green" : "bg-budget-red/10 text-budget-red"
                  }`}>
                    {crypto.changePercent >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {formatPercent(crypto.changePercent)}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Live</span>
                  </div>
                  <div>Vol: {formatCurrency(crypto.volume / 1000000000, "USD")}B</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No cryptocurrency data available</p>
            <Button variant="outline" className="mt-4">Refresh Data</Button>
          </div>
        )}
      </CardContent>
    </GlassmorphicCard>
  );
};

export default BitcoinTracker;
