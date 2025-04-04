// News API integration for market sentiment analysis

import axios from 'axios';

// News API endpoints
const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';
const CRYPTO_PANIC_ENDPOINT = 'https://cryptopanic.com/api/v1/posts/';

// If you have actual API keys, replace these
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const CRYPTO_PANIC_API_KEY = import.meta.env.VITE_CRYPTO_PANIC_API_KEY || '';

// News article interface
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1 scale
  keywords: string[];
  relatedAssets: string[];
}

/**
 * Fetch news articles related to a specific cryptocurrency
 * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param limit Number of articles to fetch
 * @returns Array of news articles
 */
export async function fetchNewsForCrypto(symbol: string, limit: number = 10): Promise<NewsArticle[]> {
  try {
    // Check if we have a real API key
    if (NEWS_API_KEY) {
      const response = await axios.get(NEWS_API_ENDPOINT, {
        params: {
          q: `cryptocurrency ${symbol}`,
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY,
          pageSize: limit
        }
      });
      
      return response.data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        description: article.description || '',
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
        sentimentScore: calculateSentimentScore(article.title + ' ' + (article.description || '')),
        keywords: extractKeywords(article.title + ' ' + (article.description || '')),
        relatedAssets: [symbol]
      }));
    } else {
      // Use mock data if no API key is available
      return generateMockNewsData(symbol, limit);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateMockNewsData(symbol, limit);
  }
}

/**
 * Fetch social media sentiment for a cryptocurrency
 * @param symbol Cryptocurrency symbol
 * @returns Social sentiment data
 */
export async function fetchSocialSentiment(symbol: string): Promise<any> {
  try {
    if (CRYPTO_PANIC_API_KEY) {
      const response = await axios.get(CRYPTO_PANIC_ENDPOINT, {
        params: {
          auth_token: CRYPTO_PANIC_API_KEY,
          currencies: symbol,
          public: true
        }
      });
      
      // Process and return real data
      return processSocialSentimentData(response.data.results);
    } else {
      // Use mock data
      return generateMockSocialSentimentData(symbol);
    }
  } catch (error) {
    console.error('Error fetching social sentiment:', error);
    return generateMockSocialSentimentData(symbol);
  }
}

/**
 * Analyze overall sentiment for a cryptocurrency across news and social media
 * @param symbol Cryptocurrency symbol
 * @returns Aggregated sentiment data
 */
export async function analyzeOverallSentiment(symbol: string): Promise<{
  symbol: string;
  newsScore: number;
  socialScore: number;
  overallScore: number;
  sentimentChange24h: number;
  mentionsCount: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  topKeywords: string[];
}> {
  try {
    // Try to fetch real data if API keys are available
    const newsArticles = await fetchNewsForCrypto(symbol, 20);
    const socialData = await fetchSocialSentiment(symbol);
    
    // Calculate average news sentiment
    const newsScore = newsArticles.reduce((sum, article) => sum + article.sentimentScore, 0) / newsArticles.length;
    
    // Combine with social sentiment
    const overallScore = (newsScore + socialData.sentimentScore) / 2;
    
    // Extract top keywords
    const allKeywords = newsArticles.flatMap(article => article.keywords);
    const keywordCount = allKeywords.reduce((acc: Record<string, number>, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});
    
    const topKeywords = Object.entries(keywordCount)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 10)
      .map(([keyword]) => keyword);
    
    // Determine trend
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (overallScore > 0.2) trend = 'bullish';
    else if (overallScore < -0.2) trend = 'bearish';
    
    return {
      symbol,
      newsScore: newsScore * 100, // Convert to 0-100 scale
      socialScore: socialData.sentimentScore * 100,
      overallScore: overallScore * 100,
      sentimentChange24h: (Math.random() * 20) - 10, // Mock 24h change
      mentionsCount: socialData.mentionsCount,
      trend,
      topKeywords
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    
    // Return mock data if real API fails
    return {
      symbol,
      newsScore: (Math.random() * 60) + 20,
      socialScore: (Math.random() * 60) + 20,
      overallScore: (Math.random() * 60) + 20,
      sentimentChange24h: (Math.random() * 20) - 10,
      mentionsCount: Math.floor(Math.random() * 5000) + 1000,
      trend: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
      topKeywords: ['price', 'market', 'trading', 'investors', 'volatility']
    };
  }
}

// Helper function to generate mock news data
function generateMockNewsData(symbol: string, limit: number): NewsArticle[] {
  const mockNews = [];
  const currentDate = new Date();
  
  // Common cryptocurrency news themes
  const newsThemes = [
    { title: `${symbol} Price Surges After Major Institutional Adoption`, sentiment: 'positive', score: 0.8 },
    { title: `Analysts Predict ${symbol} Will Reach New All-Time Highs`, sentiment: 'positive', score: 0.7 },
    { title: `${symbol} Network Activity Hits Record Levels`, sentiment: 'positive', score: 0.6 },
    { title: `Major Exchange Lists ${symbol}, Trading Volume Spikes`, sentiment: 'positive', score: 0.5 },
    { title: `New Partnership Announced for ${symbol} Blockchain`, sentiment: 'positive', score: 0.6 },
    { title: `${symbol} Breaks Key Resistance Level, Technical Analysis`, sentiment: 'positive', score: 0.4 },
    { title: `${symbol} Faces Regulatory Scrutiny in Asian Markets`, sentiment: 'negative', score: -0.6 },
    { title: `${symbol} Drops 10% as Market Volatility Increases`, sentiment: 'negative', score: -0.7 },
    { title: `Investors Concerned About ${symbol}'s Recent Price Action`, sentiment: 'negative', score: -0.5 },
    { title: `${symbol} Trading Volume Decreases Amid Market Uncertainty`, sentiment: 'negative', score: -0.4 },
    { title: `Security Researchers Identify Vulnerabilities in ${symbol} Protocol`, sentiment: 'negative', score: -0.8 },
    { title: `${symbol} Foundation Announces Development Updates`, sentiment: 'neutral', score: 0.1 },
    { title: `${symbol} Community Debates Governance Proposals`, sentiment: 'neutral', score: 0 },
    { title: `Analysis: What's Next for ${symbol} in Current Market?`, sentiment: 'neutral', score: 0.2 },
    { title: `Technical Overview of ${symbol}'s Recent Performance`, sentiment: 'neutral', score: -0.1 },
  ];
  
  // Generate random mock news articles
  for (let i = 0; i < limit; i++) {
    const themeIndex = Math.floor(Math.random() * newsThemes.length);
    const theme = newsThemes[themeIndex];
    
    // Generate a random date within the last 7 days
    const publishDate = new Date(currentDate);
    publishDate.setDate(publishDate.getDate() - Math.floor(Math.random() * 7));
    
    // Generate random keywords
    const possibleKeywords = ['price', 'market', 'trading', 'blockchain', 'investment', 'volatility', 
                              'adoption', 'technology', 'analysis', 'regulation', 'development',
                              'mining', 'wallet', 'security', 'exchange', 'defi', 'nft'];
    const numKeywords = 3 + Math.floor(Math.random() * 4); // 3-6 keywords
    const keywords = [];
    
    for (let j = 0; j < numKeywords; j++) {
      const keywordIndex = Math.floor(Math.random() * possibleKeywords.length);
      keywords.push(possibleKeywords[keywordIndex]);
      // Remove the keyword to avoid duplicates
      possibleKeywords.splice(keywordIndex, 1);
      if (possibleKeywords.length === 0) break;
    }
    
    // Add the symbol as a keyword
    keywords.push(symbol.toLowerCase());
    
    mockNews.push({
      id: `mock-${symbol}-${i}`,
      title: theme.title,
      description: `This is a mock description for the article about ${symbol}. ${theme.sentiment === 'positive' ? 'The outlook is optimistic.' : theme.sentiment === 'negative' ? 'There are some concerns in the market.' : 'The market situation remains stable.'}`,
      url: `https://example.com/news/${symbol.toLowerCase()}-${i}`,
      publishedAt: publishDate.toISOString(),
      source: ['CoinDesk', 'CoinTelegraph', 'Bloomberg', 'Forbes', 'Decrypt'][Math.floor(Math.random() * 5)],
      sentiment: theme.sentiment as 'positive' | 'negative' | 'neutral',
      sentimentScore: theme.score,
      keywords,
      relatedAssets: [symbol, ...['BTC', 'ETH', 'SOL', 'USDT'].filter(s => s !== symbol).slice(0, 2)]
    });
  }
  
  return mockNews;
}

// Helper function to generate mock social sentiment data
function generateMockSocialSentimentData(symbol: string) {
  const mentionsCount = Math.floor(Math.random() * 5000) + 1000;
  const positiveMentions = Math.floor(mentionsCount * (0.4 + Math.random() * 0.3)); // 40-70% positive
  const negativeMentions = Math.floor(mentionsCount * (0.1 + Math.random() * 0.2)); // 10-30% negative
  const neutralMentions = mentionsCount - positiveMentions - negativeMentions;
  
  // Calculate sentiment score (-1 to 1)
  const sentimentScore = (positiveMentions - negativeMentions) / mentionsCount;
  
  return {
    symbol,
    mentionsCount,
    positiveMentions,
    negativeMentions,
    neutralMentions,
    sentimentScore,
    platforms: {
      twitter: Math.floor(mentionsCount * 0.5),
      reddit: Math.floor(mentionsCount * 0.3),
      discord: Math.floor(mentionsCount * 0.1),
      telegram: Math.floor(mentionsCount * 0.1)
    },
    topInfluencers: [
      { name: 'CryptoAnalyst', followers: 125000, sentiment: 'positive' },
      { name: 'BlockchainExpert', followers: 98000, sentiment: 'neutral' },
      { name: 'TradingGuru', followers: 87000, sentiment: 'positive' },
      { name: 'CoinSpeculator', followers: 65000, sentiment: 'negative' },
      { name: 'CryptoNewsFeed', followers: 45000, sentiment: 'neutral' }
    ],
    trending: Math.random() > 0.5
  };
}

// Helper function to process real social sentiment data (if available)
function processSocialSentimentData(data: any[]) {
  // Implementation would depend on the actual API response format
  // This is a placeholder for when real API keys are available
  return {
    mentionsCount: data.length,
    sentimentScore: 0.5, // Placeholder
    platforms: {},
    topInfluencers: [],
    trending: false
  };
}

// Simple sentiment analysis based on keyword matching
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['surge', 'gain', 'rise', 'bull', 'adoption', 'growth', 'profit', 'record', 'high', 'rally'];
  const negativeWords = ['drop', 'fall', 'crash', 'bear', 'concern', 'risk', 'loss', 'downward', 'low', 'volatile'];
  
  text = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Calculate a sentiment score between -1 and 1
function calculateSentimentScore(text: string): number {
  const sentiment = analyzeSentiment(text);
  
  if (sentiment === 'positive') {
    return 0.3 + Math.random() * 0.7; // 0.3 to 1.0
  } else if (sentiment === 'negative') {
    return -0.3 - Math.random() * 0.7; // -0.3 to -1.0
  } else {
    return -0.2 + Math.random() * 0.4; // -0.2 to 0.2
  }
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  // In a real implementation, this would use NLP libraries
  // This is a simple implementation for demo purposes
  const commonKeywords = [
    'price', 'market', 'trading', 'blockchain', 'investment', 'volatility', 
    'adoption', 'technology', 'analysis', 'regulation', 'development',
    'mining', 'wallet', 'security', 'exchange', 'defi', 'nft'
  ];
  
  text = text.toLowerCase();
  return commonKeywords.filter(keyword => text.includes(keyword)).slice(0, 5);
} 