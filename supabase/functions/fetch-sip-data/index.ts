
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
    const { categories } = await req.json();
    
    // For demonstration purposes, we'll generate mock data
    // In a real implementation, you would make API requests to a SIP data provider
    const allCategories = ["Large Cap", "Mid Cap", "Small Cap", "Multi Cap", "ELSS", "Debt", "Hybrid", "Index"];
    const filteredCategories = categories && Array.isArray(categories) && categories.length > 0 
      ? categories 
      : allCategories;
    
    const mockSIPData = [];
    
    for (const category of filteredCategories) {
      // Generate 2-3 funds per category
      const fundsCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < fundsCount; i++) {
        mockSIPData.push({
          id: `${category.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`,
          name: `${category} Growth Fund ${i + 1}`,
          category,
          nav: Math.random() * 500 + 50,
          change: (Math.random() * 10) - 5,
          changePercent: (Math.random() * 3) - 1.5,
          oneYearReturn: (Math.random() * 30) - 5,
          threeYearReturn: (Math.random() * 40) - 2,
          fiveYearReturn: (Math.random() * 60),
          risk: ["Very Low", "Low", "Moderate", "High", "Very High"][Math.floor(Math.random() * 5)],
        });
      }
    }

    return new Response(JSON.stringify(mockSIPData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-sip-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
