
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { fetchNews, NewsItem } from '@/services/newsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink, Clock, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TextToSpeech from '@/components/accessibility/TextToSpeech';

const NewsPage: React.FC = () => {
  const [category, setCategory] = useState<string>('markets');

  const { data: newsItems, isLoading, error, refetch } = useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNews(category, 20),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  // Function to read news content for accessibility
  const getNewsDescription = (item: NewsItem) => {
    return `${item.title}. ${item.summary} Published by ${item.source} ${getRelativeTime(item.published_at)}.`;
  };

  const getPageDescription = () => {
    if (isLoading) return "Loading financial news...";
    if (error) return "Error loading news. Please try again.";
    if (!newsItems || newsItems.length === 0) return "No financial news available at the moment.";
    
    return `Showing latest financial news for ${category}. There are ${newsItems.length} articles available.`;
  };

  return (
    <Layout>
      <div className="container py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green">
              Financial News
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Latest updates from financial markets
              <TextToSpeech text={getPageDescription()} />
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="markets" value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="economy">Economy</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
          </TabsList>
          
          <TabsContent value={category}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="relative">
                      <Skeleton className="h-48 w-full" />
                    </div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="mb-6 border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Error Loading News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We encountered a problem fetching the latest news. Please try again later.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => refetch()}>Try Again</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems?.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="h-48 w-full object-cover" 
                        />
                      ) : (
                        <div className="bg-muted h-48 w-full flex items-center justify-center">
                          <span className="text-muted-foreground">No image available</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {item.source}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                        <Clock className="h-3.5 w-3.5 ml-2" />
                        <span>{getRelativeTime(item.published_at)}</span>
                      </div>
                      <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge className="mr-1">{item.category}</Badge>
                        {item.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="mr-1">{tag}</Badge>
                        ))}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3">
                        {item.summary}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <TextToSpeech 
                          text={getNewsDescription(item)} 
                          buttonLabel="Listen" 
                          iconOnly
                        />
                      </div>
                      <Button asChild variant="ghost" className="gap-1">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          Read more
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NewsPage;
