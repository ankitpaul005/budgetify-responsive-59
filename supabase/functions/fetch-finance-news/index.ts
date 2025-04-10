
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  published_at: string;
  url: string;
  image_url?: string;
  category: string;
  tags?: string[];
}

// This function would fetch real news in a production environment
// For the demo, we're generating mock data that looks realistic
const getMockFinancialNews = (category: string, limit: number): NewsItem[] => {
  const newsItems: NewsItem[] = [];
  
  const currentDate = new Date();
  currentDate.setFullYear(2025); // Set year to 2025 as requested
  
  // Sources for financial news
  const sources = ['Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal', 'Reuters', 'The Economic Times', 'Moneycontrol'];
  
  // Different headlines based on categories
  const headlines: Record<string, string[]> = {
    markets: [
      'Global Markets Rally as Inflation Concerns Ease',
      'Asian Markets Lead Gains After Strong Economic Data',
      'European Markets Close Higher Despite Banking Concerns',
      'Markets React Positively to Central Bank Comments',
      'Wall Street Hits Record High as Tech Stocks Surge',
      'Market Volatility Increases Amid Global Tensions'
    ],
    stocks: [
      'Tech Giants Report Better Than Expected Earnings',
      'EV Maker Stock Jumps 15% on New Battery Technology',
      'Healthcare Stocks Rise on Breakthrough Treatment Approval',
      'Chip Manufacturer Shares Tumble on Supply Chain Issues',
      'Retail Stocks Mixed After Consumer Spending Report',
      'Green Energy Stocks Gain Following Climate Policy Announcement'
    ],
    crypto: [
      'Bitcoin Surpasses $100,000 Milestone',
      'Major Bank Launches Cryptocurrency Custody Service',
      'Ethereum Upgrade Improves Transaction Speeds',
      'Regulators Approve New Crypto ETF Products',
      'Central Banks Accelerate CBDC Development Plans',
      'Crypto Market Correction as Investors Take Profits'
    ],
    economy: [
      'GDP Growth Exceeds Expectations in Q2 2025',
      'Unemployment Rate Falls to Post-Pandemic Low',
      'Inflation Data Shows Price Pressures Moderating',
      'Central Bank Maintains Interest Rates, Signals Future Cuts',
      'Consumer Confidence Index Reaches Five-Year High',
      'Housing Market Stabilizes After Policy Adjustments'
    ],
    commodities: [
      'Oil Prices Surge as Supply Concerns Intensify',
      'Gold Reaches All-Time High on Safe Haven Demand',
      'Rare Earth Metals Rally on Tech Manufacturing Boom',
      'Agricultural Commodities Rise on Adverse Weather Reports',
      'Copper Demand Increases with Green Energy Transition',
      'Natural Gas Prices Volatile Ahead of Winter Season'
    ]
  };
  
  // Generate mock news articles
  for (let i = 0; i < limit; i++) {
    // Generate a date within the last week
    const publishedDate = new Date(currentDate);
    publishedDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 7));
    publishedDate.setHours(Math.floor(Math.random() * 24));
    publishedDate.setMinutes(Math.floor(Math.random() * 60));
    
    // Select a news source
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    // Select a headline based on category, defaulting to markets if category doesn't exist
    const headlinesForCategory = headlines[category] || headlines.markets;
    const title = headlinesForCategory[Math.floor(Math.random() * headlinesForCategory.length)];
    
    // Generate a summary
    const summary = `${title}. Latest updates on ${category} and insights from ${source}. Financial markets continue to respond to global economic indicators and company performance metrics.`;
    
    // Tags related to the category
    const tags = [category, 'finance', 'investing', '2025-outlook'];
    
    // Add some variation to make each news item unique
    const uniqueSuffix = i % 2 === 0 ? ' as investors react to recent developments' : ' in unprecedented market conditions';
    
    newsItems.push({
      id: `news-${Date.now()}-${i}`,
      title: `${title}${uniqueSuffix}`,
      summary,
      source,
      published_at: publishedDate.toISOString(),
      url: 'https://www.moneycontrol.com/',
      image_url: `https://picsum.photos/seed/${Date.now() + i}/800/400`,
      category,
      tags
    });
  }
  
  return newsItems;
};

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'markets', limit = 10 } = await req.json();
    
    // Get mock financial news
    const newsItems = getMockFinancialNews(category, limit);

    return new Response(
      JSON.stringify(newsItems),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
