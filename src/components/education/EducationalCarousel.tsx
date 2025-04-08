
import React from 'react';
import { Book, TrendingUp, CircleCheck, LogIn, HelpCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface EducationalStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
}

const educationalSteps: EducationalStep[] = [
  {
    title: "Welcome to Crypto Spread Navigator",
    description: "Your all-in-one platform for crypto arbitrage trading. This guide will walk you through the essentials of using our platform to identify and capitalize on price differences across exchanges.",
    icon: <Book className="h-8 w-8 text-blue-500" />,
    tips: ["Take your time to explore each section", "You can return to this guide anytime"]
  },
  {
    title: "Getting Started",
    description: "Create your account and log in to access all features. Connect your exchange API keys in your profile settings to enable automated trading and real-time portfolio tracking.",
    icon: <LogIn className="h-8 w-8 text-blue-500" />,
    tips: ["Keep your API keys secure", "Enable 2FA for additional security", "Only grant read permissions initially until you're comfortable"]
  },
  {
    title: "Understanding the Dashboard",
    description: "The Dashboard provides a comprehensive overview of market conditions and current arbitrage opportunities. Monitor volume trends, price movements, and potential profit scenarios at a glance.",
    icon: <Info className="h-8 w-8 text-blue-500" />,
    tips: ["Check the Dashboard daily for market insights", "Pay attention to volume indicators for liquidity"]
  },
  {
    title: "Using the Arbitrage Scanner",
    description: "The Scanner identifies price differences for the same asset across different exchanges. Filter by exchange, pair, and minimum profit percentage to find the most lucrative opportunities.",
    icon: <TrendingUp className="h-8 w-8 text-green-500" />,
    tips: ["Start with major coins that have high liquidity", "Consider transaction fees when evaluating opportunities", "Look for consistent price differences rather than one-time anomalies"]
  },
  {
    title: "Evaluating Risk",
    description: "Not all arbitrage opportunities are equal. Use our built-in Risk Management tools to assess factors like liquidity, withdrawal times, and potential price movement during execution.",
    icon: <HelpCircle className="h-8 w-8 text-amber-500" />,
    tips: ["Higher profits often come with higher risks", "Check withdrawal times for each exchange", "Start with small trades to test execution speeds"]
  },
  {
    title: "Executing Trades",
    description: "Execute trades manually or configure automated bots to act on your behalf. Set profit thresholds, maximum trade amounts, and risk parameters to ensure optimal performance.",
    icon: <CircleCheck className="h-8 w-8 text-green-500" />,
    tips: ["Start with manual trades to understand the process", "Use small amounts when first configuring bots", "Regularly review and adjust your bot settings"]
  }
];

const BeginnerEducationalCarousel = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Book className="h-4 w-4" /> Beginner's Guide
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:max-w-[600px] sm:max-w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-center">Crypto Arbitrage Trading Guide</SheetTitle>
          <SheetDescription className="text-center">
            Learn how to navigate the platform and maximize your trading profits
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-8">
          <Carousel className="w-full">
            <CarouselContent>
              {educationalSteps.map((step, index) => (
                <CarouselItem key={index} className="px-1 md:basis-full">
                  <Card className="border-slate-700 bg-slate-800 text-white">
                    <CardHeader className="flex flex-col items-center pb-2">
                      <div className="mb-4 p-3 rounded-full bg-slate-700">
                        {step.icon}
                      </div>
                      <CardTitle className="text-xl text-center">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-slate-300">{step.description}</p>
                      
                      {step.tips && step.tips.length > 0 && (
                        <div className="mt-6 bg-slate-700/50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-400 mb-2">Pro Tips:</h4>
                          <ul className="text-left space-y-2">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2 text-slate-200">
                                <div className="mt-1 text-blue-400">•</div>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6 pt-2">
                      <p className="text-sm text-slate-400">Step {index + 1} of {educationalSteps.length}</p>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-6">
              <CarouselPrevious className="relative -left-0" />
              <CarouselNext className="relative -right-0" />
            </div>
          </Carousel>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BeginnerEducationalCarousel;
