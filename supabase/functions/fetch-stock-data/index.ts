
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
    
    // For demonstration purposes, we'll generate mock data
    // In a real implementation, you would make API requests to a stock data provider
    const mockStockData = symbols.map((symbol) => ({
      symbol,
      name: `${symbol} Corporation`,
      price: Math.random() * 1000 + 100,
      change: (Math.random() * 20) - 10,
      changePercent: (Math.random() * 5) - 2.5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      lastUpdated: new Date().toISOString(),
    }));

    return new Response(JSON.stringify(mockStockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-stock-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
