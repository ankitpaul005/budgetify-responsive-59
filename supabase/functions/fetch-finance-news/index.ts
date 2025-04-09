
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
    const { category = 'markets', limit = 10 } = await req.json();
    
    // Get API key from environment variable
    const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY") || "";
    
    if (!NEWS_API_KEY) {
      console.warn("News API key not found, using mock data");
      return mockNewsResponse(category, limit);
    }
    
    try {
      // Using newsapi.org as an example - replace with your preferred news API
      const url = `https://newsapi.org/v2/top-headlines?category=business&q=${category}&apiKey=${NEWS_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`News API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error("Unexpected data format from News API");
      }
      
      // Transform the data to our format
      const newsItems = data.articles.slice(0, limit).map((article: any) => ({
        id: crypto.randomUUID(),
        title: article.title,
        summary: article.description,
        content: article.content,
        source: article.source?.name || "Unknown Source",
        published_at: article.publishedAt,
        url: article.url,
        image_url: article.urlToImage,
        category: category,
        tags: [category, 'finance', 'investing'],
      }));
      
      return new Response(JSON.stringify(newsItems), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error fetching news for category ${category}:`, error);
      return mockNewsResponse(category, limit);
    }
  } catch (error) {
    console.error('Error in fetch-finance-news function:', error);
    return mockNewsResponse('markets', 10);
  }
});

// Helper to create mock news response
function mockNewsResponse(category: string, limit: number) {
  const newsItems = generateMockNewsData(category, limit);
  
  return new Response(JSON.stringify(newsItems), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper to generate mock news data
function generateMockNewsData(category: string, limit: number) {
  const newsItems = [];
  const now = new Date();
  
  const categories = ['markets', 'stocks', 'economy', 'crypto', 'commodities'];
  const sources = ['Bloomberg', 'CNBC', 'Reuters', 'Financial Times', 'Wall Street Journal'];
  const headlines = [
    'Markets rally on positive economic data',
    'Tech stocks surge as earnings beat expectations',
    'Central bank holds interest rates steady',
    'Bitcoin reaches new all-time high',
    'Oil prices drop amid supply concerns',
    'Inflation data shows cooling consumer prices',
    'Treasury yields rise on jobs report',
    'Global markets react to geopolitical tensions',
    'Gold prices stabilize after volatile week',
    'Stock futures point to higher open',
    'Major index reaches record closing high',
    'Financial sector gains on regulatory changes',
    'Consumer sentiment improves in latest survey',
    'Corporate earnings exceed analysts' expectations',
  ];
  
  for (let i = 0; i < limit; i++) {
    const publishTime = new Date(now);
    publishTime.setHours(now.getHours() - Math.floor(Math.random() * 24));
    
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    
    newsItems.push({
      id: `news-${i + 1}`,
      title: randomHeadline,
      summary: `Latest updates on ${category} and financial insights from ${randomSource}.`,
      source: randomSource,
      published_at: publishTime.toISOString(),
      url: '#',
      image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/600/400`,
      category: category || categories[Math.floor(Math.random() * categories.length)],
      tags: [category, 'finance', 'investing'],
    });
  }
  
  return newsItems;
}
