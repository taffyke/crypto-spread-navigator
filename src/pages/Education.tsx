
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Book, 
  BookOpen, 
  GraduationCap, 
  AlertCircle, 
  TrendingUp,  
  BarChart4, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Education = () => {
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  const courses = [
    {
      id: "crypto-basics",
      title: "Cryptocurrency Fundamentals",
      description: "Learn the essentials of cryptocurrency and blockchain technology",
      icon: <Book className="h-6 w-6" />,
      topics: [
        {
          id: "what-is-crypto",
          title: "What is Cryptocurrency?",
          content: (
            <>
              <p className="mb-4">Cryptocurrency is a digital or virtual form of currency that uses cryptography for security, making it difficult to counterfeit. Unlike traditional currencies issued by governments (fiat money), cryptocurrencies operate on decentralized systems based on blockchain technology – a distributed ledger enforced by a network of computers.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Key Characteristics of Cryptocurrencies:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Decentralization:</span> No central authority like a government or bank controls most cryptocurrencies.</li>
                <li><span className="font-medium">Blockchain Technology:</span> Transactions are recorded on a public distributed ledger.</li>
                <li><span className="font-medium">Limited Supply:</span> Many cryptocurrencies have a capped supply (like Bitcoin's 21 million coins).</li>
                <li><span className="font-medium">Pseudonymity:</span> Users operate with wallet addresses rather than personal identifiers.</li>
                <li><span className="font-medium">Borderless:</span> Transactions can occur globally without traditional banking intermediaries.</li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Popular Cryptocurrencies:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><span className="font-medium">Bitcoin (BTC):</span> The first and most valuable cryptocurrency.</li>
                <li><span className="font-medium">Ethereum (ETH):</span> Known for smart contracts and decentralized applications.</li>
                <li><span className="font-medium">Solana (SOL):</span> Focuses on high-speed transactions and low fees.</li>
                <li><span className="font-medium">Cardano (ADA):</span> Emphasizes research-driven approach and sustainability.</li>
                <li><span className="font-medium">Ripple (XRP):</span> Designed for cross-border payments and remittances.</li>
              </ul>
            </>
          )
        },
        {
          id: "blockchain-explained",
          title: "Blockchain Technology Explained",
          content: (
            <>
              <p className="mb-4">Blockchain is the underlying technology that powers cryptocurrencies. It's essentially a digital ledger of transactions duplicated and distributed across an entire network of computer systems.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">How Blockchain Works:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Transaction Request:</span> A user initiates a transaction.</li>
                <li><span className="font-medium">Block Creation:</span> The transaction is grouped with others into a "block".</li>
                <li><span className="font-medium">Verification:</span> The network of computers (nodes) validates the transaction using known algorithms.</li>
                <li><span className="font-medium">Block Addition:</span> Once verified, the new block is added to the existing blockchain.</li>
                <li><span className="font-medium">Transaction Completion:</span> The transaction is now permanent and immutable.</li>
              </ol>

              <h4 className="text-lg font-medium mb-2 mt-4">Key Blockchain Properties:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Immutability:</span> Once recorded, data cannot be altered retroactively.</li>
                <li><span className="font-medium">Transparency:</span> All transactions are visible to anyone with access to the blockchain.</li>
                <li><span className="font-medium">Distributed:</span> No single entity controls the entire blockchain.</li>
                <li><span className="font-medium">Consensus:</span> Network participants must agree on the validity of transactions.</li>
              </ul>

              <div className="bg-slate-800 p-4 rounded-md mt-4 mb-4">
                <h5 className="font-medium text-blue-400 mb-2">Blockchain vs. Traditional Database:</h5>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 text-slate-300">Blockchain</th>
                      <th className="text-left py-2 text-slate-300">Traditional Database</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 text-slate-400">Decentralized control</td>
                      <td className="py-2 text-slate-400">Centralized control</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 text-slate-400">Distributed ledger</td>
                      <td className="py-2 text-slate-400">Typically centralized</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-400">Immutable records</td>
                      <td className="py-2 text-slate-400">Mutable records</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )
        },
        {
          id: "wallets-keys",
          title: "Wallets and Private Keys",
          content: (
            <>
              <p className="mb-4">Cryptocurrency wallets are tools that allow users to interact with blockchain networks. They store the private keys needed to access and manage your cryptocurrency holdings.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Types of Wallets:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Hot Wallets (Online):</span> Connected to the internet for convenience.
                  <ul className="list-disc pl-6 mt-1">
                    <li><span className="italic">Mobile Wallets:</span> Apps on smartphones (MetaMask, Trust Wallet)</li>
                    <li><span className="italic">Web Wallets:</span> Browser-based interfaces</li>
                    <li><span className="italic">Desktop Wallets:</span> Software on computers (Exodus, Electrum)</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Cold Wallets (Offline):</span> Not connected to the internet; more secure.
                  <ul className="list-disc pl-6 mt-1">
                    <li><span className="italic">Hardware Wallets:</span> Physical devices (Ledger, Trezor)</li>
                    <li><span className="italic">Paper Wallets:</span> Physical documents with keys printed</li>
                  </ul>
                </li>
              </ul>

              <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-500">Critical Security Warning</h5>
                    <p className="text-slate-300">Never share your private keys or recovery phrases with anyone. Anyone with access to these can control your cryptocurrency. Store backup phrases in secure, offline locations.</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-medium mb-2 mt-4">Private Keys vs. Public Keys:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Private Key:</span> Secret code that gives you access to your crypto; like a password.</li>
                <li><span className="font-medium">Public Key:</span> Derived from private key; creates your wallet address for receiving funds.</li>
                <li><span className="font-medium">Wallet Address:</span> What you share with others to receive cryptocurrency.</li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Best Practices:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Use hardware wallets for storing large amounts</li>
                <li>Enable two-factor authentication when available</li>
                <li>Create secure backups of recovery phrases</li>
                <li>Use different wallets for trading and long-term storage</li>
                <li>Regularly update wallet software</li>
              </ul>
            </>
          )
        },
        {
          id: "crypto-exchanges",
          title: "Understanding Crypto Exchanges",
          content: (
            <>
              <p className="mb-4">Cryptocurrency exchanges are platforms where you can buy, sell, and trade cryptocurrencies. They function similar to stock exchanges but for digital assets.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Types of Exchanges:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Centralized Exchanges (CEX):</span> Operated by companies that oversee transactions (Binance, Coinbase).
                  <ul className="list-disc pl-6 mt-1">
                    <li>Require account creation and KYC (Know Your Customer)</li>
                    <li>Higher liquidity and trading volume</li>
                    <li>Company holds your assets unless withdrawn</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Decentralized Exchanges (DEX):</span> Operate on blockchain with no central authority (Uniswap, dYdX).
                  <ul className="list-disc pl-6 mt-1">
                    <li>No account creation needed, connect via wallet</li>
                    <li>No custody of funds (non-custodial)</li>
                    <li>Smart contract-based trading</li>
                  </ul>
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Key Exchange Features:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><span className="font-medium">Liquidity:</span> How easily assets can be bought/sold without affecting price</li>
                <li><span className="font-medium">Trading Pairs:</span> Combinations of cryptocurrencies that can be traded</li>
                <li><span className="font-medium">Order Types:</span> Market orders, limit orders, stop orders, etc.</li>
                <li><span className="font-medium">Fees:</span> Trading fees, withdrawal fees, deposit fees</li>
                <li><span className="font-medium">Security Features:</span> Two-factor authentication, cold storage policy</li>
              </ul>

              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-blue-400">Exchange Selection Tip</h5>
                    <p className="text-slate-300">When choosing an exchange, prioritize security, regulatory compliance, and fee structures that match your trading frequency. Consider using multiple exchanges to take advantage of different features and mitigate risk.</p>
                  </div>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      id: "arbitrage-trading",
      title: "Arbitrage Trading",
      description: "Master the art of profiting from price differences across exchanges",
      icon: <TrendingUp className="h-6 w-6" />,
      topics: [
        {
          id: "what-is-arbitrage",
          title: "What is Crypto Arbitrage?",
          content: (
            <>
              <p className="mb-4">Cryptocurrency arbitrage is the practice of taking advantage of price differences for the same asset across different markets or exchanges. Because cryptocurrency markets are decentralized and fragmented, price discrepancies occur frequently.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">How Arbitrage Works:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>Identify price differences for the same cryptocurrency across exchanges</li>
                <li>Buy the cryptocurrency at the lower price on one exchange</li>
                <li>Transfer the cryptocurrency to the exchange with the higher price</li>
                <li>Sell the cryptocurrency at the higher price</li>
                <li>Profit from the price difference minus fees and costs</li>
              </ol>

              <h4 className="text-lg font-medium mb-2 mt-4">Types of Arbitrage:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Spatial Arbitrage:</span> Taking advantage of price differences between different exchanges.
                  <div className="bg-slate-800 p-3 rounded my-2">
                    <span className="font-medium text-blue-400">Example:</span> Bitcoin is $50,100 on Exchange A and $50,500 on Exchange B. Buy on A, sell on B for $400 profit (minus fees).
                  </div>
                </li>
                <li>
                  <span className="font-medium">Triangular Arbitrage:</span> Converting between three different cryptocurrencies on a single exchange to profit from pricing inefficiencies.
                  <div className="bg-slate-800 p-3 rounded my-2">
                    <span className="font-medium text-blue-400">Example:</span> Convert USD → BTC → ETH → USD, ending with more USD than you started with.
                  </div>
                </li>
                <li>
                  <span className="font-medium">Cross-Border Arbitrage:</span> Taking advantage of price differences in different countries or regions.
                  <div className="bg-slate-800 p-3 rounded my-2">
                    <span className="font-medium text-blue-400">Example:</span> Bitcoin priced higher in South Korea (the "Kimchi premium") than in the US.
                  </div>
                </li>
              </ul>
            </>
          )
        },
        {
          id: "arbitrage-risks",
          title: "Risks and Challenges",
          content: (
            <>
              <p className="mb-4">While arbitrage trading can be profitable, it comes with several risks and challenges that traders need to understand.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Key Risks in Arbitrage Trading:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Speed and Timing:</span> Arbitrage opportunities can disappear quickly, sometimes in seconds.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">By the time you execute all steps of an arbitrage trade, prices may have already converged.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Transaction Fees:</span> Exchange trading fees, withdrawal fees, and network transaction fees can reduce or eliminate potential profits.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Example: A 0.5% trading fee on both sides of a trade with a 1% price difference leaves no profit.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Transfer Delays:</span> Moving crypto between exchanges can take minutes to hours depending on network congestion.
                </li>
                <li>
                  <span className="font-medium">Exchange Risk:</span> Exchanges could freeze withdrawals, get hacked, or experience technical issues.
                </li>
                <li>
                  <span className="font-medium">Market Volatility:</span> Prices can change dramatically during the arbitrage process, potentially causing losses.
                </li>
                <li>
                  <span className="font-medium">Liquidity Issues:</span> Insufficient liquidity might prevent executing trades at the expected prices.
                </li>
              </ul>

              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-400">Important Risk Warning</h5>
                    <p className="text-slate-300">Never commit more capital to arbitrage trading than you can afford to lose. Start with small trades to understand the practical challenges before scaling up.</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-medium mb-2 mt-4">Arbitrage Risk Management:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Pre-fund exchanges to avoid transfer delays</li>
                <li>Calculate all fees beforehand to ensure profitability</li>
                <li>Use limit orders instead of market orders when possible</li>
                <li>Diversify across multiple exchanges</li>
                <li>Start with smaller amounts to test strategies</li>
                <li>Use automated tools to detect and execute opportunities faster</li>
              </ul>
            </>
          )
        },
        {
          id: "arbitrage-strategies",
          title: "Effective Arbitrage Strategies",
          content: (
            <>
              <p className="mb-4">Successful cryptocurrency arbitrage requires thoughtful strategies and effective execution. Here are some proven approaches to arbitrage trading.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Advanced Arbitrage Strategies:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Multi-Exchange Arbitrage:</span> Maintaining balances across multiple exchanges to execute faster trades.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Keep both fiat and crypto on various exchanges to avoid transfer times.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Statistical Arbitrage:</span> Using historical data and statistical models to identify recurring patterns in price discrepancies.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Example: Some exchanges consistently lag others during market volatility.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Flash Arbitrage:</span> Executing trades extremely quickly using APIs and automated systems.
                </li>
                <li>
                  <span className="font-medium">Cross-Asset Arbitrage:</span> Finding price differences between related assets (like Bitcoin futures and spot prices).
                </li>
                <li>
                  <span className="font-medium">Low-Liquidity Arbitrage:</span> Taking advantage of wider spreads on less-traded pairs (higher risk but potentially higher reward).
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Technical Setup for Arbitrage:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Data Collection:</span> Set up reliable data feeds from multiple exchanges.
                </li>
                <li>
                  <span className="font-medium">Analysis System:</span> Create or use tools to quickly identify opportunities.
                </li>
                <li>
                  <span className="font-medium">Execution Infrastructure:</span> Establish API connections to exchanges for faster trading.
                </li>
                <li>
                  <span className="font-medium">Risk Management Rules:</span> Define clear parameters for trade size and acceptable risk.
                </li>
                <li>
                  <span className="font-medium">Performance Tracking:</span> Keep detailed records of all trades to analyze effectiveness.
                </li>
              </ol>

              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-green-400">Pro Strategy Tip</h5>
                    <p className="text-slate-300">Focus on a smaller set of cryptocurrency pairs initially. Master the timing and execution with those pairs before expanding to others. This allows you to understand the specific behaviors and patterns of those markets.</p>
                  </div>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      id: "platform-guide",
      title: "Platform User Guide",
      description: "Learn how to use Crypto Spread Navigator effectively",
      icon: <BookOpen className="h-6 w-6" />,
      topics: [
        {
          id: "getting-started",
          title: "Getting Started with the Platform",
          content: (
            <>
              <p className="mb-4">Welcome to Crypto Spread Navigator – your comprehensive tool for cryptocurrency arbitrage trading. This guide will help you navigate the platform and start using its features effectively.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Setting Up Your Account:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Create an Account:</span> Sign up with your email address and create a secure password.
                </li>
                <li>
                  <span className="font-medium">Enable Two-Factor Authentication:</span> Add an extra layer of security to your account in the Profile section.
                </li>
                <li>
                  <span className="font-medium">Connect Exchange APIs:</span> Link your exchange accounts by adding API keys in the Settings area.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Note: For security, use API keys with read-only access when first testing the platform.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Set Notification Preferences:</span> Choose how you want to be alerted about arbitrage opportunities.
                </li>
              </ol>

              <h4 className="text-lg font-medium mb-2 mt-4">Interface Overview:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Dashboard:</span> Central hub showing market overview and key opportunities</li>
                <li><span className="font-medium">Scanner:</span> Tool for finding arbitrage opportunities across exchanges</li>
                <li><span className="font-medium">Market Analysis:</span> Detailed market data, trends, and correlations</li>
                <li><span className="font-medium">Performance:</span> Tracking of your trading history and profit metrics</li>
                <li><span className="font-medium">Bots:</span> Automated trading solutions configuration area</li>
              </ul>

              <div className="bg-blue-900/20 border p-4 rounded my-4">
                <h5 className="font-medium text-blue-400 mb-2">Navigation Tips:</h5>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the sidebar menu to navigate between major sections</li>
                  <li>The search bar at the top allows quick access to any feature</li>
                  <li>Notification bell shows alerts and new opportunities</li>
                  <li>Your profile menu contains account settings and preferences</li>
                </ul>
              </div>
            </>
          )
        },
        {
          id: "scanner-usage",
          title: "Using the Arbitrage Scanner",
          content: (
            <>
              <p className="mb-4">The Arbitrage Scanner is the core tool of the platform, designed to help you find and analyze price differences across exchanges.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Scanner Features:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Real-time Data:</span> Continuously updated pricing from all connected exchanges.
                </li>
                <li>
                  <span className="font-medium">Opportunity Table:</span> Sortable list of current arbitrage opportunities.
                  <ul className="list-disc pl-6 mt-1">
                    <li>Trading pair identification</li>
                    <li>Buy and sell exchange recommendations</li>
                    <li>Price difference percentage</li>
                    <li>Estimated profit after fees</li>
                    <li>Volume availability</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Filtering Options:</span> Narrow down opportunities based on your preferences.
                  <ul className="list-disc pl-6 mt-1">
                    <li>Minimum profit percentage</li>
                    <li>Specific exchanges</li>
                    <li>Cryptocurrency pairs</li>
                    <li>Minimum trading volume</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Risk Calculation:</span> Assessment of each opportunity's risk level and feasibility.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">How to Use the Scanner:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Select Exchanges:</span> Choose which exchanges to include in your search.</li>
                <li><span className="font-medium">Set Filters:</span> Adjust minimum profit threshold and other parameters.</li>
                <li><span className="font-medium">Review Opportunities:</span> Examine the list of potential arbitrage trades.</li>
                <li><span className="font-medium">Analyze Details:</span> Click on an opportunity to see in-depth information.</li>
                <li><span className="font-medium">Execute Trade:</span> Either manually trade based on the information or set up a bot to execute automatically.</li>
              </ol>

              <div className="bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-purple-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-purple-400">Scanner Pro Tip</h5>
                    <p className="text-slate-300">Set up custom alerts for high-potential opportunities. This allows you to be notified when especially profitable trades emerge, even if you're not actively monitoring the scanner.</p>
                  </div>
                </div>
              </div>
            </>
          )
        },
        {
          id: "using-bots",
          title: "Configuring Trading Bots",
          content: (
            <>
              <p className="mb-4">The Trading Bots section allows you to automate your arbitrage trading strategy, executing trades without manual intervention when specific conditions are met.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Bot Types Available:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Arbitrage Bots:</span> Automatically execute trades when price differences exceed your threshold.
                </li>
                <li>
                  <span className="font-medium">Triangular Arbitrage Bots:</span> Execute three-way trades on a single exchange.
                </li>
                <li>
                  <span className="font-medium">Market Making Bots:</span> Provide liquidity by placing both buy and sell orders.
                </li>
                <li>
                  <span className="font-medium">Custom Strategy Bots:</span> Create complex conditional strategies with multiple parameters.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Setting Up Your First Bot:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Select Bot Type:</span> Choose which type of trading bot to create.</li>
                <li><span className="font-medium">Define Parameters:</span> Set the trading pairs, profit thresholds, and risk limits.</li>
                <li>
                  <span className="font-medium">Exchange Selection:</span> Choose which exchanges the bot will operate on.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Note: Ensure your API keys have trading permissions for these exchanges.</p>
                  </div>
                </li>
                <li><span className="font-medium">Fund Allocation:</span> Set maximum trade sizes and capital allocation limits.</li>
                <li><span className="font-medium">Test Mode:</span> Run the bot in simulation mode before using real funds.</li>
                <li><span className="font-medium">Activate:</span> Once satisfied with the settings, activate the bot.</li>
              </ol>

              <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-500">Important Bot Safety Guidelines</h5>
                    <p className="text-slate-300">Start with small trade amounts when using bots for the first time. Regularly monitor bot performance and be prepared to quickly disable them if market conditions change dramatically.</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-medium mb-2 mt-4">Bot Monitoring and Management:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Check the bot dashboard regularly to review performance</li>
                <li>Set up notifications for successful trades and errors</li>
                <li>Review logs to understand bot decision-making</li>
                <li>Adjust parameters based on performance data</li>
                <li>Pause bots during highly volatile market conditions</li>
              </ul>
            </>
          )
        },
        {
          id: "tracking-performance",
          title: "Performance Tracking and Analysis",
          content: (
            <>
              <p className="mb-4">The Performance section helps you track your trading history, analyze profits and losses, and improve your strategies over time.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Key Performance Features:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Trade History:</span> Complete record of all manual and automated trades.
                  <ul className="list-disc pl-6 mt-1">
                    <li>Date and time of execution</li>
                    <li>Pair traded and exchanges used</li>
                    <li>Trade volume and exact prices</li>
                    <li>Fees paid and net profit/loss</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Performance Metrics:</span> Key statistics about your trading activity.
                  <ul className="list-disc pl-6 mt-1">
                    <li>Total profit/loss</li>
                    <li>Profit percentage relative to capital</li>
                    <li>Success rate of arbitrage attempts</li>
                    <li>Average profit per trade</li>
                    <li>Risk-adjusted return metrics</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Visual Analytics:</span> Charts and graphs to visualize performance.
                </li>
                <li>
                  <span className="font-medium">Bot Performance:</span> Specific metrics for each automated trading bot.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">How to Use Performance Analytics:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Regular Reviews:</span> Set aside time weekly to review your trading performance.</li>
                <li><span className="font-medium">Compare Strategies:</span> Analyze which approaches are yielding the best results.</li>
                <li><span className="font-medium">Identify Patterns:</span> Look for time periods or market conditions that favor your strategy.</li>
                <li><span className="font-medium">Adjust Parameters:</span> Use insights to refine your trading bots and manual processes.</li>
                <li><span className="font-medium">Export Data:</span> Download reports for more detailed analysis or tax purposes.</li>
              </ol>

              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-green-400">Performance Analysis Tip</h5>
                    <p className="text-slate-300">Pay special attention to your risk-adjusted returns, not just total profit. A strategy with moderate but consistent profits may be better than one with occasional large gains but higher risk of losses.</p>
                  </div>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      id: "advanced-techniques",
      title: "Advanced Trading Techniques",
      description: "Expert-level strategies for experienced traders",
      icon: <GraduationCap className="h-6 w-6" />,
      topics: [
        {
          id: "market-inefficiencies",
          title: "Identifying Market Inefficiencies",
          content: (
            <>
              <p className="mb-4">Beyond basic arbitrage, advanced traders look for subtle market inefficiencies that can be exploited for profit.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Types of Market Inefficiencies:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Price Lag Inefficiencies:</span> When price updates on one exchange consistently lag behind others.
                </li>
                <li>
                  <span className="font-medium">Liquidity Imbalances:</span> When order books are significantly thinner on one exchange.
                </li>
                <li>
                  <span className="font-medium">Futures Premiums/Discounts:</span> Price differences between spot and futures markets.
                </li>
                <li>
                  <span className="font-medium">Funding Rate Arbitrage:</span> Taking advantage of perpetual futures funding rates.
                </li>
                <li>
                  <span className="font-medium">Regional Price Differences:</span> When certain regions value assets differently.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Analysis Techniques:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><span className="font-medium">Statistical Analysis:</span> Use historical data to identify recurring patterns.</li>
                <li><span className="font-medium">Correlation Studies:</span> Analyze how prices move in relation to each other.</li>
                <li><span className="font-medium">Order Book Analysis:</span> Examine depth and spread across exchanges.</li>
                <li><span className="font-medium">Volume Profile Analysis:</span> Understand liquidity distribution across price levels.</li>
                <li><span className="font-medium">Network Flow Analysis:</span> Track large transfers between exchanges.</li>
              </ol>

              <div className="bg-slate-800 p-4 rounded my-4">
                <h5 className="font-medium text-blue-400 mb-2">Case Study: Funding Rate Arbitrage</h5>
                <p className="text-slate-300 mb-2">In perpetual futures markets, funding rates are used to keep futures prices close to spot prices. When funding rates become extreme, traders can:</p>
                <ol className="list-decimal pl-6 text-slate-300">
                  <li>Take a long position on the perpetual contract</li>
                  <li>Short an equivalent amount on the spot market</li>
                  <li>Collect the funding rate while maintaining a hedged position</li>
                </ol>
              </div>

              <div className="bg-blue-900/20 border p-4 rounded my-4">
                <h5 className="font-medium text-blue-400 mb-2">Advanced Tool Usage:</h5>
                <p className="text-slate-300">Use the platform's Market Analysis tools to identify correlations and divergences between related assets. The heatmap view can reveal unexpected relationships that may represent arbitrage opportunities.</p>
              </div>
            </>
          )
        },
        {
          id: "risk-management",
          title: "Advanced Risk Management",
          content: (
            <>
              <p className="mb-4">Sophisticated risk management is what separates successful traders from those who eventually lose their capital, especially in arbitrage trading.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Advanced Risk Management Techniques:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Position Sizing:</span> Mathematically optimal allocation of capital per trade.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">Example: Kelly Criterion - a formula that determines the optimal size of a series of bets to maximize logarithmic wealth growth.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Portfolio Risk Distribution:</span> Spreading risk across multiple strategies and markets.
                </li>
                <li>
                  <span className="font-medium">Slippage Modeling:</span> Predicting price impact when entering or exiting positions.
                </li>
                <li>
                  <span className="font-medium">Counterparty Risk Assessment:</span> Evaluating the reliability of exchanges and services.
                </li>
                <li>
                  <span className="font-medium">Tail Risk Hedging:</span> Protection against extreme market events.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Implementing Risk Controls:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Set Maximum Drawdown Limits:</span> Automatically stop trading if losses reach a certain threshold.
                </li>
                <li>
                  <span className="font-medium">Implement Circuit Breakers:</span> Pause trading during extreme volatility.
                </li>
                <li>
                  <span className="font-medium">Use Value at Risk (VaR) Models:</span> Estimate potential losses within a confidence interval.
                </li>
                <li>
                  <span className="font-medium">Maintain a Reserve Fund:</span> Keep capital available to exploit opportunities during market stress.
                </li>
                <li>
                  <span className="font-medium">Stress Test Strategies:</span> Simulate how strategies would perform in extreme conditions.
                </li>
              </ol>

              <div className="bg-purple-900/20 border p-4 rounded my-4">
                <h5 className="font-medium text-purple-400 mb-2">Platform Risk Management Tools:</h5>
                <p className="text-slate-300 mb-2">Crypto Spread Navigator provides several specialized risk management features:</p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Risk Assessment Scores for each arbitrage opportunity</li>
                  <li>Exchange Risk Profiles based on historical reliability</li>
                  <li>Liquidity Analysis to estimate maximum trade sizes</li>
                  <li>Scenario Simulation to test strategy performance</li>
                  <li>Automated Risk Limit Enforcement for bots</li>
                </ul>
              </div>
            </>
          )
        },
        {
          id: "market-making",
          title: "Arbitrage and Market Making",
          content: (
            <>
              <p className="mb-4">Market making is a sophisticated strategy where traders provide liquidity by simultaneously placing buy and sell orders, profiting from the spread while also capitalizing on arbitrage opportunities.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Market Making Fundamentals:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Providing Liquidity:</span> Placing limit orders on both sides of the order book.
                </li>
                <li>
                  <span className="font-medium">Capturing the Spread:</span> Earning the difference between bid and ask prices.
                </li>
                <li>
                  <span className="font-medium">Inventory Management:</span> Balancing holdings to minimize directional risk.
                </li>
                <li>
                  <span className="font-medium">Fee Advantages:</span> Many exchanges offer lower fees for market makers.
                </li>
              </ul>

              <h4 className="text-lg font-medium mb-2 mt-4">Combining Market Making with Arbitrage:</h4>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Cross-Exchange Market Making:</span> Place orders on multiple exchanges simultaneously.
                  <div className="bg-slate-800 p-2 rounded my-1">
                    <p className="text-sm text-slate-300">When orders fill on one exchange, hedge by executing opposite trades on exchanges with favorable prices.</p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Dynamic Order Placement:</span> Adjust order prices based on opportunities across the market.
                </li>
                <li>
                  <span className="font-medium">Latency Arbitrage:</span> Capitalize on price updates that occur faster on some exchanges.
                </li>
                <li>
                  <span className="font-medium">Rebate Harvesting:</span> Maximize exchange fee rebates while maintaining a hedged position.
                </li>
              </ol>

              <h4 className="text-lg font-medium mb-2 mt-4">Advanced Implementation:</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <span className="font-medium">Order Book Imbalance Detection:</span> Adjust strategies based on order book dynamics.
                </li>
                <li>
                  <span className="font-medium">Predictive Modeling:</span> Use machine learning to anticipate price movements.
                </li>
                <li>
                  <span className="font-medium">Smart Order Routing:</span> Automatically direct orders to exchanges with optimal conditions.
                </li>
                <li>
                  <span className="font-medium">Real-time Risk Calculation:</span> Continuously monitor and adjust exposure.
                </li>
              </ul>

              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-green-400">Expert Strategy Note</h5>
                    <p className="text-slate-300">Market making can generate more consistent returns than pure arbitrage, but requires sophisticated algorithms and excellent risk management. Start with smaller, less competitive pairs when first implementing this strategy.</p>
                  </div>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      id: "faq-help",
      title: "FAQs & Help Center",
      description: "Common questions and troubleshooting assistance",
      icon: <HelpCircle className="h-6 w-6" />,
      topics: [
        {
          id: "general-faq",
          title: "General Questions",
          content: (
            <>
              <h4 className="text-xl font-medium mb-4 mt-2">Frequently Asked Questions</h4>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-left">
                    What is Crypto Spread Navigator?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>Crypto Spread Navigator is a cryptocurrency arbitrage and market analysis platform that helps traders identify and execute profitable trading opportunities across multiple exchanges. It provides tools for arbitrage scanning, market analysis, automated trading, portfolio tracking, and performance monitoring.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2">
                  <AccordionTrigger className="text-left">
                    Is Crypto Spread Navigator suitable for beginners?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>While beginners can use the platform to learn about arbitrage trading, it's most beneficial for traders with at least basic cryptocurrency trading experience. We recommend new users start with the educational materials in the Education Center and practice with small amounts until they gain confidence.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3">
                  <AccordionTrigger className="text-left">
                    How do I connect my exchange accounts?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>Go to Profile → API Keys section, select your exchange, and add the API key and secret. For security, we recommend initially creating API keys with read-only access, and only enabling trading permissions once you're comfortable with the platform.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4">
                  <AccordionTrigger className="text-left">
                    Are my API keys secure?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>Yes. Your API keys are encrypted using industry-standard encryption before being stored. The platform never has access to withdraw funds from your exchanges unless you explicitly provide withdraw permissions (which we don't recommend).</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5">
                  <AccordionTrigger className="text-left">
                    How accurate is the arbitrage data?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>We fetch real-time data directly from exchanges via API connections. While we strive for high accuracy, there can be slight delays due to API latency. The platform accounts for trading fees in profit calculations, but you should always verify opportunities before trading, especially during volatile market conditions.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q6">
                  <AccordionTrigger className="text-left">
                    Can I use the platform on mobile devices?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>Yes, Crypto Spread Navigator is responsive and works on mobile devices, though the full feature set is best experienced on desktop. We're working on dedicated mobile apps to provide an optimized mobile experience.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q7">
                  <AccordionTrigger className="text-left">
                    How much capital do I need to start arbitrage trading?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>While there's no minimum requirement, effective arbitrage trading typically requires enough capital to cover transaction fees and overcome minimum order sizes across exchanges. We recommend starting with at least $1,000 in capital spread across a few exchanges to test strategies before scaling up.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )
        },
        {
          id: "troubleshooting",
          title: "Troubleshooting Common Issues",
          content: (
            <>
              <p className="mb-4">If you encounter issues while using the platform, this guide can help you resolve common problems.</p>
              
              <h4 className="text-lg font-medium mb-2 mt-4">Connection Issues:</h4>
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-red-400">API Connection Failed</h5>
                  <p className="text-slate-300 mb-2">Problem: Unable to connect to exchange APIs or seeing "Connection Failed" errors.</p>
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="font-medium text-green-400 mb-1">Solution:</p>
                    <ol className="list-decimal pl-6 text-slate-300">
                      <li>Verify your API keys are entered correctly</li>
                      <li>Check if your API keys have the necessary permissions</li>
                      <li>Ensure your IP address is whitelisted on the exchange if required</li>
                      <li>Try generating new API keys if problems persist</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-red-400">Data Not Updating</h5>
                  <p className="text-slate-300 mb-2">Problem: Price or arbitrage data seems outdated or frozen.</p>
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="font-medium text-green-400 mb-1">Solution:</p>
                    <ol className="list-decimal pl-6 text-slate-300">
                      <li>Refresh the browser page</li>
                      <li>Check your internet connection</li>
                      <li>Temporarily disable ad blockers or VPNs that might interfere</li>
                      <li>Clear browser cache and cookies</li>
                    </ol>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-medium mb-2 mt-4">Trading Issues:</h4>
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-red-400">Bot Not Executing Trades</h5>
                  <p className="text-slate-300 mb-2">Problem: Automated trading bot doesn't execute trades despite visible opportunities.</p>
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="font-medium text-green-400 mb-1">Solution:</p>
                    <ol className="list-decimal pl-6 text-slate-300">
                      <li>Verify your API keys have trading permissions enabled</li>
                      <li>Check that your profit threshold isn't set too high</li>
                      <li>Ensure you have sufficient funds on the exchanges</li>
                      <li>Review the bot logs for specific error messages</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-red-400">Opportunity Disappeared Too Quickly</h5>
                  <p className="text-slate-300 mb-2">Problem: Arbitrage opportunities vanish before you can execute trades.</p>
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="font-medium text-green-400 mb-1">Solution:</p>
                    <ol className="list-decimal pl-6 text-slate-300">
                      <li>Use the automated trading bots for faster execution</li>
                      <li>Pre-fund your exchange accounts to avoid transfer delays</li>
                      <li>Focus on less competitive pairs with longer-lasting opportunities</li>
                      <li>Consider adjusting your minimum profit threshold</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded my-4">
                <div className="flex items-start">
                  <HelpCircle className="h-6 w-6 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-blue-400">Need Further Assistance?</h5>
                    <p className="text-slate-300">If you've tried the troubleshooting steps and still face issues, please contact our support team through the Help button in the top navigation bar or email support@cryptospreadnavigator.com.</p>
                  </div>
                </div>
              </div>
            </>
          )
        }
      ]
    }
  ];

  // Function to render the course list/selector
  const renderCourseSelector = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {courses.map((course) => (
          <Card 
            key={course.id}
            className={`cursor-pointer transition-all border-slate-700 hover:border-blue-500 ${
              activeCourse === course.id ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-900'
            }`}
            onClick={() => setActiveCourse(course.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-md text-blue-500">
                  {course.icon}
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                {course.description}
              </CardDescription>
              <div className="mt-3 text-xs text-slate-500">
                {course.topics.length} topics
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Function to render the course content
  const renderCourseContent = () => {
    const selectedCourse = courses.find(course => course.id === activeCourse);
    
    if (!selectedCourse) {
      return (
        <div className="text-center p-12 border border-dashed border-slate-700 rounded-lg">
          <GraduationCap className="h-16 w-16 text-slate-600 mx-auto" />
          <h3 className="text-xl font-medium mt-4 mb-2">Select a Learning Path</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Choose a learning path from the options above to begin exploring educational content tailored to your needs.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-slate-800 rounded-md text-blue-500">
            {selectedCourse.icon}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{selectedCourse.title}</h2>
            <p className="text-slate-400">{selectedCourse.description}</p>
          </div>
        </div>

        <Tabs defaultValue={selectedCourse.topics[0].id} className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-slate-800 overflow-x-auto flex-nowrap border-b border-slate-700 rounded-none p-0">
            {selectedCourse.topics.map((topic) => (
              <TabsTrigger 
                key={topic.id} 
                value={topic.id}
                className="data-[state=active]:bg-slate-900 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-3"
              >
                {topic.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {selectedCourse.topics.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="border border-slate-700 rounded-md p-6 bg-slate-900">
              <ScrollArea className="h-[60vh]">
                <div className="pr-4">
                  {topic.content}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Education Center</h1>
        <p className="text-slate-400">Expand your knowledge of cryptocurrency, arbitrage trading, and platform features.</p>
      </div>

      <Separator className="my-6 bg-slate-800" />
      
      {renderCourseSelector()}
      {renderCourseContent()}
      
      <div className="mt-12 bg-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Need personalized guidance?</h3>
            <p className="text-slate-400">Our support team is ready to assist with any questions about trading or using the platform.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <HelpCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Education;
