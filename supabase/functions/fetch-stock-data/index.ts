
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
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      throw new Error('Invalid request: symbols must be an array');
    }
    
    // Get API key from environment variable
    const ALPHA_VANTAGE_API_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY") || "";
    
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("Alpha Vantage API key not found, using mock data");
      return mockResponse(symbols);
    }
    
    // Fetch real data from Alpha Vantage
    const stockDataPromises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`Alpha Vantage API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we have valid data
        if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
          const quote = data["Global Quote"];
          const price = parseFloat(quote["05. price"]);
          const change = parseFloat(quote["09. change"]);
          const changePercent = parseFloat(quote["10. change percent"].replace('%', ''));
          
          return {
            symbol,
            name: `${symbol}`,
            price,
            change,
            changePercent,
            volume: parseInt(quote["06. volume"]),
            marketCap: price * 1000000, // This is approximate as Alpha Vantage doesn't provide market cap in this endpoint
            lastUpdated: new Date().toISOString(),
          };
        } else {
          console.error(`Invalid data format from Alpha Vantage for symbol ${symbol}:`, data);
          throw new Error("Invalid data format from Alpha Vantage");
        }
      } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        // Fall back to mock data for this symbol
        return createMockStockData(symbol);
      }
    });
    
    // Wait for all API calls to complete
    const stockData = await Promise.all(stockDataPromises);
    
    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-stock-data function:', error);
    return mockResponse(error.symbols || ["AAPL", "MSFT", "GOOG"]);
  }
});

// Helper to create mock response
function mockResponse(symbols) {
  const mockStockData = symbols.map(createMockStockData);
  
  return new Response(JSON.stringify(mockStockData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper to create mock stock data
function createMockStockData(symbol) {
  const isPositive = Math.random() > 0.4; // 60% chance of positive change
  const price = Math.random() * 1000 + 100;
  const change = isPositive 
    ? Math.random() * 20
    : -Math.random() * 20;
  const changePercent = (change / price) * 100;
  
  return {
    symbol,
    name: `${symbol} Corporation`,
    price,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    lastUpdated: new Date().toISOString(),
  };
}
