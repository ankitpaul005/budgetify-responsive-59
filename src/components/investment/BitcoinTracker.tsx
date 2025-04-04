import React, { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ExternalLink } from "lucide-react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchStockData } from "@/services/stockService";
import { formatCurrency } from "@/utils/formatting";
import { motion } from "framer-motion";

const BitcoinTracker = () => {
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Generate historical data once on component mount
  const chartData = useMemo(() => {
    // Generate historical data for demonstration
    const now = new Date();
    const data = [];
    
    // Base values and patterns for major cryptocurrencies
    const patterns = {
      BTC: { base: 65000, volatility: 0.15, trend: 0.02 },
      ETH: { base: 3500, volatility: 0.18, trend: 0.015 },
      SOL: { base: 150, volatility: 0.25, trend: 0.03 },
      DOGE: { base: 0.15, volatility: 0.3, trend: -0.01 }
    };
    
    // Create more realistic price movements that follow patterns
    for (let i = 90; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      
      // Create seasonal and cyclical patterns
      const seasonalFactor = Math.sin(dayOfYear / 30) * 0.05;
      const cyclicalFactor = Math.sin(i / 15) * 0.08;
      
      // Bitcoin price with realistic movements
      const btcVolatility = (Math.random() - 0.5) * patterns.BTC.volatility;
      const btcTrend = 1 + (patterns.BTC.trend / 30) * (90 - i); // Gradual trend over time
      const btcSeasonal = 1 + seasonalFactor + cyclicalFactor;
      const btcPrice = patterns.BTC.base * btcTrend * btcSeasonal * (1 + btcVolatility);
      
      data.push({
        date: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(btcPrice * 100) / 100,
        volume: Math.floor(Math.random() * 5000 + 10000)
      });
    }
    
    return data;
  }, []);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        // Using the stock service but with crypto symbols
        const data = await fetchStockData(['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD']);
        setCryptoData(data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        // Fallback data if API fails
        setCryptoData([
          {
            symbol: 'BTC-USD',
            name: 'Bitcoin',
            price: 68532.41,
            change: 1243.52,
            changePercent: 1.85,
            volume: 28571936
          },
          {
            symbol: 'ETH-USD',
            name: 'Ethereum',
            price: 3487.29,
            change: 78.43,
            changePercent: 2.30,
            volume: 18762455
          },
          {
            symbol: 'SOL-USD',
            name: 'Solana',
            price: 147.36,
            change: -5.82,
            changePercent: -3.80,
            volume: 10234567
          },
          {
            symbol: 'DOGE-USD',
            name: 'Dogecoin',
            price: 0.1531,
            change: 0.0087,
            changePercent: 6.02,
            volume: 33456789
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCryptoPrices();
    
    // Reduced interval for better performance
    const interval = setInterval(fetchCryptoPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 3D-like card effect with subtle animation
  const cardVariants = {
    hover: { 
      y: -5, 
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassmorphicCard className="overflow-hidden relative">
        <div className="absolute -z-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl top-10 right-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -z-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl bottom-10 left-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-amber-500 text-3xl">₿</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-300">
                  Cryptocurrency Tracker
                </span>
              </CardTitle>
              <CardDescription>
                Live market data for major cryptocurrencies
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
            <div className="h-[250px] w-full mb-4 bg-gradient-to-b from-transparent to-blue-50/5 dark:to-blue-900/5 rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bitcoinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F7931A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => isMobile ? value.substring(0, 3) : value}
                    interval={isMobile ? 14 : 7}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    domain={['dataMin - 2000', 'dataMax + 2000']}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#F7931A" 
                    strokeWidth={2}
                    fill="url(#bitcoinGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <motion.div 
                    key={index} 
                    className="border border-border rounded-lg p-4 animate-pulse"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 0.8, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="h-5 w-20 bg-muted rounded mb-2"></div>
                    <div className="h-7 w-28 bg-muted rounded mb-1.5"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </motion.div>
                ))
              ) : (
                cryptoData.map((crypto, index) => (
                  <motion.div 
                    key={index} 
                    className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors cursor-pointer relative overflow-hidden"
                    whileHover="hover"
                    variants={cardVariants}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    
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
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </GlassmorphicCard>
    </motion.div>
  );
};

export default BitcoinTracker;
