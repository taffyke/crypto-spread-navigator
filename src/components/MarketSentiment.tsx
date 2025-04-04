import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Newspaper, 
  MessageSquare, 
  ExternalLink,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeOverallSentiment, fetchNewsForCrypto, NewsArticle } from '@/lib/newsAPI';
import { formatPercentage } from '@/lib/dataUtils';
import { cn } from '@/lib/utils';

interface MarketSentimentProps {
  cryptoSymbol: string;
  initialNewsData?: NewsArticle[];
  initialSentimentData?: {
    overallScore: number;
    newsScore: number;
    socialScore: number;
    sentimentChange24h: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    mentionsCount: number;
    topKeywords: string[];
  };
}

const MarketSentiment: React.FC<MarketSentimentProps> = ({ 
  cryptoSymbol, 
  initialNewsData, 
  initialSentimentData 
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(!initialSentimentData);
  const [newsData, setNewsData] = useState<NewsArticle[]>(initialNewsData || []);
  const [sentimentData, setSentimentData] = useState(initialSentimentData);
  const [timeframe, setTimeframe] = useState('7d');
  
  // Fetch sentiment data if not provided
  useEffect(() => {
    if (!initialSentimentData) {
      fetchSentimentData();
    }
    if (!initialNewsData) {
      fetchNews();
    }
  }, [cryptoSymbol]);

  const fetchSentimentData = async () => {
    setIsLoading(true);
    try {
      const data = await analyzeOverallSentiment(cryptoSymbol);
      setSentimentData(data);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const articles = await fetchNewsForCrypto(cryptoSymbol, 10);
      setNewsData(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get sentiment icon
  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral', className = "h-4 w-4") => {
    if (sentiment === 'positive') return <TrendingUp className={cn(className, "text-green-400")} />;
    if (sentiment === 'negative') return <TrendingDown className={cn(className, "text-red-400")} />;
    return <Minus className={cn(className, "text-slate-400")} />;
  };

  // Get trend icon for sentiment change
  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-3 w-3 text-green-400" />;
    if (change < 0) return <ArrowDownRight className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-slate-400" />;
  };

  // Get sentiment color classes
  const getSentimentClasses = (score: number, type: 'bg' | 'text' | 'border' = 'bg') => {
    if (score > 60) {
      if (type === 'bg') return 'bg-green-900/30';
      if (type === 'text') return 'text-green-400';
      return 'border-green-700';
    }
    if (score < 40) {
      if (type === 'bg') return 'bg-red-900/30';
      if (type === 'text') return 'text-red-400';
      return 'border-red-700';
    }
    if (type === 'bg') return 'bg-slate-700/50';
    if (type === 'text') return 'text-slate-300';
    return 'border-slate-600';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Market Sentiment Analysis
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              News and social media sentiment for {cryptoSymbol}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="h-7 text-xs bg-slate-900 border-slate-700 w-24">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900 mb-4">
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
            <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
            <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-0">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-sm text-slate-400">Loading sentiment data...</div>
              </div>
            ) : sentimentData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Overall Sentiment */}
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-xs font-medium">Overall Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-4">
                      <div className="flex items-center mb-2">
                        <div className={cn(
                          "text-2xl font-semibold",
                          getSentimentClasses(sentimentData.overallScore, 'text')
                        )}>
                          {Math.round(sentimentData.overallScore)}
                        </div>
                        <div className="ml-2 flex items-center text-xs">
                          {getTrendIcon(sentimentData.sentimentChange24h)}
                          <span className={sentimentData.sentimentChange24h >= 0 ? "text-green-400" : "text-red-400"}>
                            {formatPercentage(Math.abs(sentimentData.sentimentChange24h), true)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className={cn("h-full", getSentimentClasses(sentimentData.overallScore))}
                          style={{ width: `${Math.max(5, Math.min(100, sentimentData.overallScore))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Bearish</span>
                        <span>Neutral</span>
                        <span>Bullish</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mt-2 font-normal text-xs",
                          sentimentData.trend === 'bullish' ? "bg-green-900/20 text-green-400 border-green-800" :
                          sentimentData.trend === 'bearish' ? "bg-red-900/20 text-red-400 border-red-800" :
                          "bg-slate-800 border-slate-700"
                        )}
                      >
                        {sentimentData.trend === 'bullish' ? "Bullish" : 
                         sentimentData.trend === 'bearish' ? "Bearish" : "Neutral"} market sentiment
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* News Sentiment */}
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-xs font-medium flex items-center">
                        <Newspaper className="h-3 w-3 mr-1" />
                        News Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-4">
                      <div className="flex items-center mb-2">
                        <div className={cn(
                          "text-2xl font-semibold",
                          getSentimentClasses(sentimentData.newsScore, 'text')
                        )}>
                          {Math.round(sentimentData.newsScore)}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div 
                          className={cn("h-full", getSentimentClasses(sentimentData.newsScore))}
                          style={{ width: `${Math.max(5, Math.min(100, sentimentData.newsScore))}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-400">
                        <div className="flex justify-between mb-1">
                          <span>Negative</span>
                          <span>{newsData.filter(n => n.sentiment === 'negative').length} articles</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Neutral</span>
                          <span>{newsData.filter(n => n.sentiment === 'neutral').length} articles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Positive</span>
                          <span>{newsData.filter(n => n.sentiment === 'positive').length} articles</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Sentiment */}
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-xs font-medium flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Social Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-4">
                      <div className="flex items-center mb-2">
                        <div className={cn(
                          "text-2xl font-semibold",
                          getSentimentClasses(sentimentData.socialScore, 'text')
                        )}>
                          {Math.round(sentimentData.socialScore)}
                        </div>
                        <div className="ml-2 text-xs text-slate-400">
                          {sentimentData.mentionsCount.toLocaleString()} mentions
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div 
                          className={cn("h-full", getSentimentClasses(sentimentData.socialScore))}
                          style={{ width: `${Math.max(5, Math.min(100, sentimentData.socialScore))}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sentimentData.topKeywords.slice(0, 5).map(keyword => (
                          <Badge key={keyword} variant="outline" className="bg-slate-800 border-slate-700 text-[10px]">
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-xs font-medium mb-2">Top Keywords in Discussion</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {sentimentData.topKeywords.map((keyword, index) => (
                      <div key={keyword} className="bg-slate-850 border border-slate-700 rounded-md p-2">
                        <div className="text-xs font-medium">{keyword}</div>
                        <Progress 
                          value={100 - (index * 15)} 
                          className="h-1 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-sm text-slate-400">No sentiment data available</div>
              </div>
            )}
          </TabsContent>
          
          {/* News Tab */}
          <TabsContent value="news" className="mt-0">
            <ScrollArea className="h-[400px] rounded-md border border-slate-700">
              <div className="p-4 space-y-3">
                {newsData.length > 0 ? (
                  newsData.map((article, index) => (
                    <div key={index} className="border-b border-slate-700 pb-3 last:border-0">
                      <div className="flex justify-between mb-1">
                        <Badge 
                          className={cn(
                            "font-normal text-xs",
                            article.sentiment === 'positive' ? "bg-green-900/20 text-green-400 border-green-700" :
                            article.sentiment === 'negative' ? "bg-red-900/20 text-red-400 border-red-700" :
                            "bg-slate-800 border-slate-700"
                          )}
                        >
                          {getSentimentIcon(article.sentiment, "h-3 w-3 mr-1")}
                          <span className="capitalize">{article.sentiment}</span>
                        </Badge>
                        <div className="flex items-center text-xs text-slate-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(article.publishedAt)}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium mb-1">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors flex items-start"
                        >
                          {article.title}
                          <ExternalLink className="h-3 w-3 ml-1 inline-block flex-shrink-0" />
                        </a>
                      </h4>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{article.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-500">Source: {article.source}</div>
                        <div className="flex gap-1">
                          {article.relatedAssets.map((asset, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-[10px] bg-slate-850 border-slate-700"
                            >
                              {asset}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-sm text-slate-400">No news articles available</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Social Tab */}
          <TabsContent value="social" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs font-medium">Social Media Mentions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {sentimentData && (
                    <div className="p-4">
                      <div className="text-2xl font-semibold">{sentimentData.mentionsCount.toLocaleString()}</div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span>Twitter</span>
                            <span>{Math.round(sentimentData.mentionsCount * 0.5).toLocaleString()}</span>
                          </div>
                          <Progress value={50} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span>Reddit</span>
                            <span>{Math.round(sentimentData.mentionsCount * 0.3).toLocaleString()}</span>
                          </div>
                          <Progress value={30} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span>Discord</span>
                            <span>{Math.round(sentimentData.mentionsCount * 0.1).toLocaleString()}</span>
                          </div>
                          <Progress value={10} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span>Telegram</span>
                            <span>{Math.round(sentimentData.mentionsCount * 0.1).toLocaleString()}</span>
                          </div>
                          <Progress value={10} className="h-1" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs font-medium">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {sentimentData && (
                    <div className="p-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                          <div className="text-lg font-semibold">{Math.round(sentimentData.socialScore)}</div>
                          <div 
                            className={cn(
                              "absolute inset-0 rounded-full border-4 border-transparent border-t-4",
                              getSentimentClasses(sentimentData.socialScore, 'border')
                            )}
                            style={{
                              transform: `rotate(${Math.min(360, sentimentData.socialScore * 3.6)}deg)`,
                              transition: 'transform 1s ease-out'
                            }}
                          ></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span>Positive</span>
                              </div>
                              <span>
                                {Math.round(45 + (sentimentData.socialScore - 50) / 2)}%
                              </span>
                            </div>
                            <Progress 
                              value={45 + (sentimentData.socialScore - 50) / 2} 
                              className="h-1 bg-slate-700" 
                              indicatorClassName="bg-green-500"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
                                <span>Neutral</span>
                              </div>
                              <span>
                                {Math.round(25 - Math.abs(sentimentData.socialScore - 50) / 4)}%
                              </span>
                            </div>
                            <Progress 
                              value={25 - Math.abs(sentimentData.socialScore - 50) / 4} 
                              className="h-1 bg-slate-700" 
                              indicatorClassName="bg-slate-400"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                <span>Negative</span>
                              </div>
                              <span>
                                {Math.round(30 - (sentimentData.socialScore - 50) / 2)}%
                              </span>
                            </div>
                            <Progress 
                              value={30 - (sentimentData.socialScore - 50) / 2} 
                              className="h-1 bg-slate-700" 
                              indicatorClassName="bg-red-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium">Top Influencers</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center p-2 bg-slate-800 rounded-md">
                            <span className="font-medium">CryptoAnalyst</span>
                            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800 text-[10px]">
                              Positive
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-800 rounded-md">
                            <span className="font-medium">BlockchainExpert</span>
                            <Badge variant="outline" className="bg-slate-700 border-slate-600 text-[10px]">
                              Neutral
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-800 rounded-md">
                            <span className="font-medium">TradingGuru</span>
                            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800 text-[10px]">
                              Positive
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t border-slate-700 pt-3 text-xs text-slate-400">
        <p>Sentiment analysis combines news sources and social media to gauge market perception.</p>
      </CardFooter>
    </Card>
  );
};

export default MarketSentiment; 