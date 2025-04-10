
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BeginnerEducationalCarousel from '@/components/education/EducationalCarousel';
import { Book, Lightbulb, TrendingUp, ChevronRight, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Education = () => {
  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Education Center</h1>
          <p className="text-slate-400">Learn everything about arbitrage trading, crypto markets, and maximizing your profits</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <BeginnerEducationalCarousel />
        </div>
      </div>

      <Tabs defaultValue="beginner" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 mb-6">
          <TabsTrigger value="beginner" className="data-[state=active]:bg-blue-600">
            Beginner
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="data-[state=active]:bg-blue-600">
            Intermediate
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-600">
            Advanced
          </TabsTrigger>
          <TabsTrigger value="workshops" className="data-[state=active]:bg-blue-600">
            Workshops
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beginner" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-3">
                  <div className="bg-blue-900/50 p-3 rounded-full">
                    <Book className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-center">Crypto Basics</CardTitle>
                <CardDescription className="text-center text-slate-400">
                  Start your journey with the fundamentals of cryptocurrency
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-blue-400 mr-2" />
                    What is cryptocurrency?
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-blue-400 mr-2" />
                    Blockchain technology explained
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-blue-400 mr-2" />
                    How to set up your first wallet
                  </p>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-3">
                  <div className="bg-green-900/50 p-3 rounded-full">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-center">Arbitrage 101</CardTitle>
                <CardDescription className="text-center text-slate-400">
                  Understand the fundamentals of arbitrage trading
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-green-400 mr-2" />
                    What is arbitrage trading?
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-green-400 mr-2" />
                    Types of crypto arbitrage
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-green-400 mr-2" />
                    Risk management essentials
                  </p>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-3">
                  <div className="bg-purple-900/50 p-3 rounded-full">
                    <Lightbulb className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <CardTitle className="text-center">Market Research</CardTitle>
                <CardDescription className="text-center text-slate-400">
                  Learn how to research and analyze market opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-purple-400 mr-2" />
                    Finding trading opportunities
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-purple-400 mr-2" />
                    Understanding exchange fees
                  </p>
                  <p className="flex items-center text-slate-300">
                    <ChevronRight className="h-4 w-4 text-purple-400 mr-2" />
                    Calculating profit potential
                  </p>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                Latest Beginner Workshop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-md flex items-center justify-center mb-4">
                <div className="text-slate-400 flex flex-col items-center">
                  <Book className="h-12 w-12 mb-2" />
                  <p>Workshop Preview</p>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Introduction to Cross-Exchange Arbitrage</h3>
              <p className="text-slate-400 mb-4">
                Learn how to identify and capitalize on price differences between exchanges, 
                with practical examples and step-by-step guides for beginners.
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">
                  Duration: 45 minutes
                </div>
                <Button>Watch Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intermediate" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 text-white p-6">
            <h3 className="text-xl font-medium mb-4">Intermediate content coming soon!</h3>
            <p className="text-slate-400">
              Our team is preparing advanced materials on triangular arbitrage, 
              automated trading strategies, and cross-border arbitrage techniques.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 text-white p-6">
            <h3 className="text-xl font-medium mb-4">Advanced content coming soon!</h3>
            <p className="text-slate-400">
              Our experts are developing detailed guides on algorithmic arbitrage trading, 
              high-frequency strategies, and market making techniques.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 text-white p-6">
            <h3 className="text-xl font-medium mb-4">Workshops schedule coming soon!</h3>
            <p className="text-slate-400">
              We're planning weekly live workshops with industry experts. 
              Sign up to get notified when registration opens.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Education;
