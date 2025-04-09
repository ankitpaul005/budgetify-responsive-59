
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
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

export const fetchNews = async (category: string = 'markets', limit: number = 10): Promise<NewsItem[]> => {
  try {
    // Try to fetch from a real API through our Edge Function
    const { data, error } = await supabase.functions.invoke("fetch-finance-news", {
      body: { category, limit },
    });

    if (error) {
      console.error("Error fetching news:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch news:", error);
    
    // Generate mock news data as fallback
    const mockNews: NewsItem[] = [];
    
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
      'Corporate earnings exceed analysts\' expectations', // Added escape character
    ];
    
    const currentDate = new Date();
    
    for (let i = 0; i < limit; i++) {
      const publishedDate = new Date();
      publishedDate.setHours(currentDate.getHours() - Math.floor(Math.random() * 24));
      
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
      
      mockNews.push({
        id: `news-${i + 1}`,
        title: randomHeadline,
        summary: `Latest updates on ${randomCategory} and financial insights from ${randomSource}.`,
        source: randomSource,
        published_at: publishedDate.toISOString(),
        url: '#',
        category: randomCategory,
        tags: [randomCategory, 'finance', 'investing'],
      });
    }
    
    return mockNews;
  }
};
