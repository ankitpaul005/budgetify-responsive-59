
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe = "1D" } = await req.json();
    
    if (!symbol) {
      throw new Error('Invalid request: symbol is required');
    }
    
    // Get API key from environment variable
    const ALPHA_VANTAGE_API_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY") || "";
    
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("Alpha Vantage API key not found, using mock data");
      return mockResponse(symbol, timeframe);
    }
    
    // Map timeframe to Alpha Vantage function and interval
    const { function: avFunction, interval, outputsize } = getAlphaVantageParams(timeframe);
    
    try {
      // Fetch historical data from Alpha Vantage
      const url = `https://www.alphavantage.co/query?function=${avFunction}&symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Alpha Vantage API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data based on the API response format
      let historicalData = [];
      
      if (avFunction === 'TIME_SERIES_INTRADAY' && data['Time Series (5min)']) {
        const timeSeries = data['Time Series (5min)'];
        historicalData = Object.entries(timeSeries).map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }));
      } else if (avFunction === 'TIME_SERIES_DAILY' && data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        historicalData = Object.entries(timeSeries).map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }));
      } else {
        throw new Error("Unexpected data format from Alpha Vantage");
      }
      
      // Sort by date ascending
      historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return new Response(JSON.stringify(historicalData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error fetching historical data for symbol ${symbol}:`, error);
      return mockResponse(symbol, timeframe);
    }
  } catch (error) {
    console.error('Error in fetch-stock-historical-data function:', error);
    return mockResponse("AAPL", "1D");
  }
});

// Helper to map timeframe to Alpha Vantage parameters
function getAlphaVantageParams(timeframe) {
  switch (timeframe) {
    case "1D":
      return { function: "TIME_SERIES_INTRADAY", interval: "5min", outputsize: "compact" };
    case "5D":
      return { function: "TIME_SERIES_INTRADAY", interval: "60min", outputsize: "full" };
    case "1M":
    case "1Y":
    default:
      return { function: "TIME_SERIES_DAILY", interval: "daily", outputsize: "full" };
  }
}

// Helper to create mock historical data response
function mockResponse(symbol, timeframe) {
  const historicalData = generateMockHistoricalData(symbol, timeframe);
  
  return new Response(JSON.stringify(historicalData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper to generate mock historical data
function generateMockHistoricalData(symbol, timeframe) {
  const data = [];
  const now = new Date();
  let basePrice = 100 + Math.random() * 200;
  
  // Determine number of data points and interval based on timeframe
  let points;
  let interval;
  
  switch (timeframe) {
    case "1D":
      points = 78; // 6.5 hours of trading in 5-minute intervals
      interval = 5 * 60 * 1000; // 5 minutes in milliseconds
      break;
    case "5D":
      points = 5 * 7; // 5 days with 7 points per day
      interval = 24 * 60 * 60 * 1000 / 7; // ~3.5 hours in milliseconds
      break;
    case "1M":
      points = 30; // 30 days
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    case "1Y":
      points = 365; // 365 days
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    default:
      points = 30;
      interval = 24 * 60 * 60 * 1000;
  }
  
  // Generate data points
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * interval);
    
    // Random price movement with a trend
    const trend = Math.sin(i / points * Math.PI) * 0.5; // Add a sine wave trend
    const dailyChange = (Math.random() - 0.5 + trend) * 3; // Daily change with trend
    basePrice += dailyChange;
    
    // Ensure price doesn't go negative
    if (basePrice < 10) basePrice = 10;
    
    // Daily high/low with some randomness
    const high = basePrice + Math.random() * 5;
    const low = Math.max(basePrice - Math.random() * 5, 1);
    const open = basePrice - dailyChange;
    const close = basePrice;
    
    data.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000 + 1000000),
    });
  }
  
  return data;
}
