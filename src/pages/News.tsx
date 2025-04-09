
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchNews, NewsItem } from '@/services/newsService';
import TextToSpeech from '@/components/accessibility/TextToSpeech';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, ExternalLink } from 'lucide-react';

const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('markets');
  const categories = [
    { id: 'markets', name: 'Markets' },
    { id: 'stocks', name: 'Stocks' },
    { id: 'economy', name: 'Economy' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'commodities', name: 'Commodities' }
  ];

  const { data: newsItems, isLoading, error, refetch } = useQuery({
    queryKey: ['news', activeCategory],
    queryFn: () => fetchNews(activeCategory, 10),
  });

  // Auto-refresh news every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Get the page content as text for read aloud feature
  const getPageText = () => {
    return `Financial News Bulletin. ${activeCategory} category. ${
      newsItems ? 
      newsItems.map(item => `${item.title}. ${item.summary}`).join('. Next article. ') : 
      'Loading news...'
    }`;
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial News</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest financial market news
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TextToSpeech text={getPageText()} buttonLabel="Read News" />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetch()}
              aria-label="Refresh news"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="markets" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {isLoading ? (
                <NewsSkeletons />
              ) : error ? (
                <div className="text-center p-8">
                  <p className="text-red-500 mb-2">Error loading news</p>
                  <Button onClick={() => refetch()}>Try again</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {newsItems?.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <TextToSpeech 
            text={`${item.title}. ${item.summary || ''}`} 
            buttonLabel="" 
          />
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>{item.source}</span>
          <span>{formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{item.summary}</p>
        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="mt-4 rounded-md w-full h-48 object-cover"
          />
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            {item.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                {tag}
              </span>
            ))}
          </div>
          {item.url && item.url !== '#' && (
            <Button variant="outline" size="sm" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Read more <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const NewsSkeletons = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-32 w-full mt-4" />
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NewsPage;
