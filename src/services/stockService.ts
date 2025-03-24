
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

export interface SIPData {
  id: string;
  name: string;
  category: string;
  nav: number;
  change: number;
  changePercent: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  risk: string;
}

export const fetchStockData = async (symbols: string[]): Promise<StockData[]> => {
  try {
    // In a real implementation, this would call the Edge Function that connects to a Stock API
    const { data, error } = await supabase.functions.invoke("fetch-stock-data", {
      body: { symbols },
    });

    if (error) {
      console.error("Error fetching stock data:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch stock data:", error);
    
    // Fallback to mock data for demo purposes
    return symbols.map((symbol) => ({
      symbol,
      name: `${symbol} Corp`,
      price: Math.random() * 1000 + 100,
      change: (Math.random() * 20) - 10,
      changePercent: (Math.random() * 5) - 2.5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      lastUpdated: new Date().toISOString(),
    }));
  }
};

export const fetchSIPData = async (categories?: string[]): Promise<SIPData[]> => {
  try {
    // In a real implementation, this would call the Edge Function that connects to a SIP API
    const { data, error } = await supabase.functions.invoke("fetch-sip-data", {
      body: { categories },
    });

    if (error) {
      console.error("Error fetching SIP data:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch SIP data:", error);
    
    // Fallback to mock data for demo purposes
    return Array.from({ length: 8 }).map((_, index) => ({
      id: `sip-${index + 1}`,
      name: `SIP Fund ${index + 1}`,
      category: ["Large Cap", "Mid Cap", "Small Cap", "Multi Cap", "ELSS", "Debt", "Hybrid", "Index"][index],
      nav: Math.random() * 500 + 50,
      change: (Math.random() * 10) - 5,
      changePercent: (Math.random() * 3) - 1.5,
      oneYearReturn: (Math.random() * 30) - 5,
      threeYearReturn: (Math.random() * 40) - 2,
      fiveYearReturn: (Math.random() * 60),
      risk: ["Very Low", "Low", "Moderate", "High", "Very High"][Math.floor(Math.random() * 5)],
    }));
  }
};
