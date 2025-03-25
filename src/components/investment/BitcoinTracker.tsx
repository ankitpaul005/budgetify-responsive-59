
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ExternalLink } from "lucide-react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchStockData } from "@/services/stockService";
import { formatCurrency } from "@/utils/formatting";

const BitcoinTracker = () => {
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        // Using the stock service but with crypto symbols
        const data = await fetchStockData(['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD']);
        setCryptoData(data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCryptoPrices();
    
    // Set up interval for refreshing data every 10 seconds
    const interval = setInterval(fetchCryptoPrices, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate simple chart data
  const getBTCChartData = () => {
    // Generate fake historical data for demonstration
    const now = new Date();
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const baseValue = 60000; // Base BTC value
      const randomFactor = Math.random() * 0.2 - 0.1; // -10% to +10%
      
      data.push({
        date: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: baseValue + baseValue * randomFactor
      });
    }
    
    return data;
  };
  
  const chartData = getBTCChartData();

  return (
    <div className="mb-8">
      <GlassmorphicCard>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-amber-500">₿</span> Cryptocurrency Tracker
              </CardTitle>
              <CardDescription>
                Track major cryptocurrencies in real-time
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" asChild className="gap-1">
              <a href="https://coinmarketcap.com/" target="_blank" rel="noopener noreferrer">
                <span className="hidden sm:inline">View More</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Bitcoin Chart */}
            <div className="h-48 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.substring(0, 3)}
                    interval={6}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 2000', 'dataMax + 2000']}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#F7931A" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Crypto Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-5 w-20 bg-muted rounded mb-2"></div>
                    <div className="h-7 w-28 bg-muted rounded mb-1.5"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                ))
              ) : (
                cryptoData.map((crypto, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{crypto.symbol.split('-')[0]}</h3>
                      <div className={`text-xs px-1.5 py-0.5 rounded ${
                        crypto.changePercent >= 0 ? 'bg-budget-green-light text-budget-green' : 'bg-budget-red-light text-budget-red'
                      }`}>
                        {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(crypto.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      Volume: {(crypto.volume / 1000000).toFixed(2)}M
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </GlassmorphicCard>
    </div>
  );
};

export default BitcoinTracker;
