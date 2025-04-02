import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Key, 
  Shield, 
  BarChart4, 
  Clock, 
  LogOut, 
  ChevronRight, 
  Edit2, 
  Check, 
  X, 
  Copy, 
  Link,
  ExternalLink,
  Gift,
  Wallet,
  ArrowUpRight,
  Bell,
  BarChart2,
  AlertTriangle,
  Briefcase,
  ChartPie,
  FileText,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  CheckCircle,
  LockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Portfolio from '@/pages/Portfolio';

interface ExchangeConnection {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  lastSynced?: Date;
}

interface TradingStatistic {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

interface ApiKey {
  exchangeId: string;
  name: string;
  key: string;
  secret: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  createdAt: Date;
  lastUsed?: Date;
}

interface ProfileProps {
  initialTab?: 'profile' | 'portfolio' | 'alerts' | 'risk' | 'settings' | 'apikeys';
}

type TabType = 'profile' | 'portfolio' | 'alerts' | 'risk' | 'settings' | 'apikeys';

const Profile = ({ initialTab = 'profile' }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('Alex Thompson');
  const [newName, setNewName] = useState('Alex Thompson');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null);
  
  // Effect to sync tab from URL/props
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Mock exchanges data
  const [exchanges, setExchanges] = useState<ExchangeConnection[]>([
    { 
      id: 'binance',
      name: 'Binance', 
      logo: '/exchanges/binance.png', 
      connected: true,
      lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    { 
      id: 'coinbase',
      name: 'Coinbase', 
      logo: '/exchanges/coinbase.png', 
      connected: true,
      lastSynced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    { 
      id: 'kraken',
      name: 'Kraken', 
      logo: '/exchanges/kraken.png', 
      connected: false
    },
    { 
      id: 'kucoin',
      name: 'KuCoin', 
      logo: '/exchanges/kucoin.png', 
      connected: false
    },
    { 
      id: 'ftx',
      name: 'FTX', 
      logo: '/exchanges/ftx.png', 
      connected: false
    }
  ]);
  
  // Mock trading statistics
  const tradingStats: TradingStatistic[] = [
    { label: 'Total Profit', value: '$12,438.29', change: '+8.2%', isPositive: true },
    { label: 'Win Rate', value: '68%', change: '+4.5%', isPositive: true },
    { label: 'Avg. Return', value: '3.2%', change: '-0.5%', isPositive: false },
    { label: 'Total Trades', value: '342' },
    { label: 'Trading Volume', value: '$1.24M', change: '+12.8%', isPositive: true },
    { label: 'Active Bots', value: '3' }
  ];
  
  // API keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      exchangeId: 'binance',
      name: 'Binance Main',
      key: 'pGt93hfj2P5MyExampleKeyHere',
      secret: '******************************************',
      permissions: {
        read: true,
        trade: true,
        withdraw: false
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      exchangeId: 'coinbase',
      name: 'Coinbase Pro',
      key: 'cB94KjrT6sExampleKeyHere',
      secret: '******************************************',
      permissions: {
        read: true,
        trade: true,
        withdraw: false
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ]);
  
  const [newApiKey, setNewApiKey] = useState({
    exchangeId: '',
    name: '',
    key: '',
    secret: '',
    permissions: {
      read: true,
      trade: false,
      withdraw: false
    }
  });
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false);
  
  // Handle API key connection
  const handleConnectExchange = (exchangeId: string) => {
    setExchanges(prev => 
      prev.map(exchange => 
        exchange.id === exchangeId
          ? { ...exchange, connected: true, lastSynced: new Date() }
          : exchange
      )
    );
    
    toast({
      title: "Exchange Connected",
      description: "Your exchange has been successfully connected.",
      variant: "default",
    });
  };
  
  // Handle API key disconnection
  const handleDisconnectExchange = (exchangeId: string) => {
    setExchanges(prev => 
      prev.map(exchange => 
        exchange.id === exchangeId
          ? { ...exchange, connected: false, lastSynced: undefined }
          : exchange
      )
    );
    
    toast({
      title: "Exchange Disconnected",
      description: "Your exchange has been disconnected.",
      variant: "default",
    });
  };
  
  // Handle name save
  const handleSaveName = () => {
    setName(newName);
    setEditingName(false);
    
    toast({
      title: "Profile Updated",
      description: "Your name has been updated successfully.",
      variant: "default",
    });
  };
  
  // Format date for last synced
  const formatLastSynced = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Handle enable 2FA
  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account.",
      variant: "default",
    });
  };
  
  // Copy referral code
  const handleCopyReferral = () => {
    navigator.clipboard.writeText('CRYPTO-SPREAD-REF-12345');
    
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
      variant: "default",
    });
  };

  // Function to mask API key
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };
  
  // Function to show/hide API secret
  const toggleSecretVisibility = (exchangeId: string, keyName: string, secret: string) => {
    const keyId = `${exchangeId}-${keyName}`;
    setShowSecretFor(prevKey => prevKey === keyId ? null : keyId);
    
    if (!visibleSecrets[keyId]) {
      // Set a timeout to automatically hide the secret after 10 seconds
      setTimeout(() => {
        setShowSecretFor(prevKey => prevKey === keyId ? null : prevKey);
      }, 10000);
      
      toast({
        title: "Secret Visible",
        description: "API secret will be hidden again after 10 seconds",
        variant: "default",
      });
    }
  };
  
  // Function to copy API key to clipboard
  const copyToClipboard = (text: string, type: 'key' | 'secret') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type === 'key' ? 'API Key' : 'API Secret'} Copied`,
        description: "The value has been copied to your clipboard.",
        variant: "default",
      });
    });
  };
  
  // Function to add new API key
  const handleAddApiKey = () => {
    if (!newApiKey.exchangeId || !newApiKey.name || !newApiKey.key || !newApiKey.secret) {
      toast({
        title: "Validation Error",
        description: "All fields are required to add an API key.",
        variant: "destructive",
      });
      return;
    }
    
    const apiKey: ApiKey = {
      ...newApiKey,
      createdAt: new Date()
    };
    
    setApiKeys(prev => [...prev, apiKey]);
    
    // Update exchanges to show as connected
    setExchanges(prev => 
      prev.map(exchange => 
        exchange.id === apiKey.exchangeId
          ? { ...exchange, connected: true, lastSynced: new Date() }
          : exchange
      )
    );
    
    // Reset form and close modal
    setNewApiKey({
      exchangeId: '',
      name: '',
      key: '',
      secret: '',
      permissions: {
        read: true,
        trade: false,
        withdraw: false
      }
    });
    setShowAddApiKeyModal(false);
    
    toast({
      title: "API Key Added",
      description: "Your API key has been securely stored and validated.",
      variant: "default",
    });
  };
  
  // Function to delete API key
  const handleDeleteApiKey = (exchangeId: string, keyName: string) => {
    setApiKeys(prev => prev.filter(key => !(key.exchangeId === exchangeId && key.name === keyName)));
    
    // If no more keys for this exchange, mark as disconnected
    const hasOtherKeysForExchange = apiKeys.some(key => 
      key.exchangeId === exchangeId && key.name !== keyName
    );
    
    if (!hasOtherKeysForExchange) {
      setExchanges(prev => 
        prev.map(exchange => 
          exchange.id === exchangeId
            ? { ...exchange, connected: false, lastSynced: undefined }
            : exchange
        )
      );
    }
    
    toast({
      title: "API Key Deleted",
      description: "Your API key has been permanently removed.",
      variant: "default",
    });
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-sm md:text-base text-slate-400">
          Manage your account, portfolio, history, and settings
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700 mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-blue-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="data-[state=active]:bg-blue-600">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="pb-3">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-20 w-20 border-2 border-blue-600">
                  <AvatarImage src="/profile-avatar.jpg" alt={name} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-slate-700 border-slate-600 h-8 text-white"
                        />
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500"
                          onClick={handleSaveName}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-slate-700 hover:bg-slate-600"
                          onClick={() => setEditingName(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium">{name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                          onClick={() => {
                            setNewName(name);
                            setEditingName(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center text-slate-400 text-sm gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Member since Feb 2023</span>
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-600 hover:bg-blue-600">Pro Plan</Badge>
                    <Badge className="bg-slate-700 hover:bg-slate-700">Power Trader</Badge>
                  </div>
                </div>
                
                <Button variant="outline" className="text-sm ml-auto sm:self-start">
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value="alex.thompson@example.com" 
                        disabled 
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Badge className="bg-green-600 hover:bg-green-600">Verified</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Phone Number</label>
                    <Input 
                      value="+1 (555) 123-4567" 
                      disabled 
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Time Zone</label>
                    <Input 
                      value="Eastern Time (ET) - UTC-5" 
                      disabled 
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Default Currency</label>
                    <Input 
                      value="USD ($)" 
                      disabled 
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400 mb-1">Refer a Friend</h4>
                    <p className="text-sm text-slate-300 mb-3">
                      Invite friends to Crypto Spread Navigator and earn 15% of their trading fees for 6 months.
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <Input 
                        value="CRYPTO-SPREAD-REF-12345" 
                        readOnly
                        className="bg-slate-700 border-slate-600 text-white text-sm h-9"
                      />
                      <Button 
                        className="h-9 px-3 bg-blue-600 hover:bg-blue-500"
                        onClick={handleCopyReferral}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                      You've referred 3 users so far, earning $128.45 in rewards
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-6">
          <div className="w-full">
            <Portfolio />
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700 col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Active Alerts</CardTitle>
                  <CardDescription className="text-slate-400">Custom price and arbitrage alerts</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  New Alert
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Asset/Pair</th>
                        <th className="px-4 py-3">Condition</th>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Current</th>
                        <th className="px-4 py-3">Exchange</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {[
                        { type: 'Price', asset: 'BTC', condition: 'above', target: 65000, current: 64417.05, exchange: 'Any', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
                        { type: 'Price', asset: 'ETH', condition: 'below', target: 3400, current: 3502.50, exchange: 'Binance', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
                        { type: 'Spread', asset: 'BTC/USDT', condition: 'above', target: 300, current: 263.18, exchange: 'Binance-Coinbase', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
                        { type: 'Volume', asset: 'SOL', condition: 'above', target: 500000000, current: 382541328, exchange: 'Any', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                      ].map((alert, index) => (
                        <tr key={index} className="hover:bg-slate-700">
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={
                              alert.type === 'Price' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                              alert.type === 'Spread' ? 'bg-purple-900/20 text-purple-400 border-purple-800' :
                              'bg-amber-900/20 text-amber-400 border-amber-800'
                            }>
                              {alert.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-white">{alert.asset}</td>
                          <td className="px-4 py-3 text-slate-300">{alert.condition}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {typeof alert.target === 'number' && alert.target > 1000000 
                              ? `${(alert.target / 1000000).toFixed(2)}M` 
                              : alert.target.toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 ${
                            (alert.condition === 'above' && alert.current >= alert.target) || 
                            (alert.condition === 'below' && alert.current <= alert.target)
                              ? 'text-green-400' 
                              : 'text-slate-300'
                          }`}>
                            {typeof alert.current === 'number' && alert.current > 1000000 
                              ? `${(alert.current / 1000000).toFixed(2)}M` 
                              : alert.current.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{alert.exchange}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {alert.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Alert Notifications</CardTitle>
                <CardDescription className="text-slate-400">Configure how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white">Email Notifications</div>
                    <div className="text-xs text-slate-400">Receive alerts via email</div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white">Push Notifications</div>
                    <div className="text-xs text-slate-400">Receive alerts on your device</div>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white">SMS Notifications</div>
                    <div className="text-xs text-slate-400">Receive alerts via SMS</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Alert History</CardTitle>
                <CardDescription className="text-slate-400">Recent triggered alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Price', asset: 'BTC', condition: 'above', target: 64000, triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
                    { type: 'Spread', asset: 'ETH/USDT', condition: 'above', target: 150, triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
                    { type: 'Volume', asset: 'SOL', condition: 'above', target: 350000000, triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
                  ].map((alert, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className={
                            alert.type === 'Price' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                            alert.type === 'Spread' ? 'bg-purple-900/20 text-purple-400 border-purple-800' :
                            'bg-amber-900/20 text-amber-400 border-amber-800'
                          }>
                            {alert.type}
                          </Badge>
                          <h4 className="text-sm font-medium text-white mt-2">{alert.asset} {alert.condition} {alert.target.toLocaleString()}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Triggered: {alert.triggeredAt.toLocaleDateString()} {alert.triggeredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700 col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-white">Risk Management Settings</CardTitle>
                <CardDescription className="text-slate-400">Configure risk parameters for your trading activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Maximum Position Size</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-700 rounded-md">
                      <p className="text-xs text-slate-400 mb-1">Per Trade Max</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-white">$5,000</span>
                        <span className="text-xs text-slate-400">5% of portfolio</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        defaultValue="5"
                        className="w-full h-2 mt-3 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="p-4 bg-slate-700 rounded-md">
                      <p className="text-xs text-slate-400 mb-1">Per Asset Max</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-white">$20,000</span>
                        <span className="text-xs text-slate-400">20% of portfolio</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        defaultValue="20"
                        className="w-full h-2 mt-3 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="p-4 bg-slate-700 rounded-md">
                      <p className="text-xs text-slate-400 mb-1">Per Exchange Max</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-white">$40,000</span>
                        <span className="text-xs text-slate-400">40% of portfolio</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="90" 
                        defaultValue="40"
                        className="w-full h-2 mt-3 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Stop-Loss Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">Automatic Stop-Loss</p>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-xs text-slate-400 mb-1">Default Stop-Loss (%)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-white">5%</span>
                        <span className="text-xs text-red-400">Max loss per trade</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="15" 
                        defaultValue="5"
                        className="w-full h-2 mt-3 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="p-4 bg-slate-700 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">Automatic Take-Profit</p>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-xs text-slate-400 mb-1">Default Take-Profit (%)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-white">10%</span>
                        <span className="text-xs text-green-400">Target profit per trade</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        defaultValue="10"
                        className="w-full h-2 mt-3 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Risk Exposure Limits</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700 rounded-md">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-white">Daily Trading Limit</p>
                        <p className="text-sm text-white">$10,000</p>
                      </div>
                      <Progress value={37} className="h-2 bg-slate-600" />
                      <p className="text-xs text-slate-400 mt-1">$3,700 used today (37%)</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-md">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-white">Maximum Daily Loss</p>
                        <p className="text-sm text-white">$2,000</p>
                      </div>
                      <Progress value={12} className="h-2 bg-slate-600" />
                      <p className="text-xs text-slate-400 mt-1">$240 loss today (12%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">Save Risk Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Account Settings</CardTitle>
                  <CardDescription className="text-slate-400">Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400">Default Currency</label>
                      <select className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Language</label>
                      <select className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Time Zone</label>
                      <select className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                        <option value="UTC">UTC - Coordinated Universal Time</option>
                        <option value="EST">EST - Eastern Standard Time</option>
                        <option value="CST">CST - Central Standard Time</option>
                        <option value="PST">PST - Pacific Standard Time</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Application Settings</CardTitle>
                  <CardDescription className="text-slate-400">Customize your application experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Dark Mode</div>
                      <div className="text-xs text-slate-400">Always use dark mode</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Real-time Updates</div>
                      <div className="text-xs text-slate-400">Update data in real-time</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Enable Trading Sounds</div>
                      <div className="text-xs text-slate-400">Play sounds for trading events</div>
                    </div>
                    <Switch />
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Confirm Before Trading</div>
                      <div className="text-xs text-slate-400">Show confirmation before executing trades</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-slate-700" />
                  <div>
                    <div className="text-sm font-medium text-white mb-2">Data Refresh Interval</div>
                    <select className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="apikeys" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Exchange API Keys</CardTitle>
                  <CardDescription className="text-slate-400">Manage your exchange API connections</CardDescription>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddApiKeyModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                      <tr>
                        <th className="px-4 py-3">Exchange</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Permissions</th>
                        <th className="px-4 py-3">Added</th>
                        <th className="px-4 py-3">Key</th>
                        <th className="px-4 py-3">Secret</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {apiKeys.map((apiKey, index) => {
                        const exchange = exchanges.find(e => e.id === apiKey.exchangeId);
                        return (
                          <tr key={index} className="hover:bg-slate-700">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-6 h-6 mr-2 relative">
                                  <img 
                                    src={exchange?.logo || "/icons/exchange-default.svg"} 
                                    alt={exchange?.name || "Exchange"} 
                                    className="w-full h-full rounded-full"
                                  />
                                </div>
                                <span className="text-white">{exchange?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white">{apiKey.name}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {apiKey.permissions.read && (
                                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                                    Read
                                  </Badge>
                                )}
                                {apiKey.permissions.trade && (
                                  <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-800">
                                    Trade
                                  </Badge>
                                )}
                                {apiKey.permissions.withdraw && (
                                  <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
                                    Withdraw
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {apiKey.createdAt.toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <span className="font-mono text-xs text-slate-300">
                                  {apiKey.key.substring(0, 6)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 ml-1" 
                                  onClick={() => copyToClipboard(apiKey.key, 'key')}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {showSecretFor === `${apiKey.exchangeId}-${apiKey.name}` ? (
                                  <span className="font-mono text-xs text-red-400">
                                    {apiKey.secret}
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs text-slate-300">
                                    ••••••••••••••••
                                  </span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 ml-1" 
                                  onClick={() => toggleSecretVisibility(apiKey.exchangeId, apiKey.name, apiKey.secret)}
                                >
                                  {showSecretFor === `${apiKey.exchangeId}-${apiKey.name}` ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeleteApiKey(apiKey.exchangeId, apiKey.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {apiKeys.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center">
                              <Key className="h-10 w-10 mb-2 text-slate-600" />
                              <p>No API keys added yet</p>
                              <p className="text-xs mt-1">Add an exchange API key to enable automated trading</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Security Information</CardTitle>
                <CardDescription className="text-slate-400">Important security guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    API Key Security
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li className="flex gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>Only add API keys from exchanges you trust</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>Limit permission access to only what's needed</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>Enable IP restrictions on your exchange when possible</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>Avoid enabling withdrawal permissions unless absolutely necessary</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>Regularly rotate your API keys for better security</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border border-slate-700 rounded-lg">
                  <h3 className="text-sm font-medium text-white mb-2">API Key Storage</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    All API keys are encrypted using AES-256 encryption before being stored. Your keys are only decrypted when needed for trading operations and never transmitted unencrypted.
                  </p>
                  <div className="rounded-md bg-slate-900 p-3 text-xs font-mono overflow-x-auto">
                    <div className="flex gap-1 text-pink-400">
                      <LockIcon className="h-3.5 w-3.5 mt-0.5" />
                      <span>End-to-end encrypted</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add API Key Modal */}
      {showAddApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Add New API Key</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddApiKeyModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Exchange
                  </label>
                  <select 
                    value={newApiKey.exchangeId}
                    onChange={(e) => setNewApiKey({...newApiKey, exchangeId: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select Exchange</option>
                    {exchanges.map(exchange => (
                      <option key={exchange.id} value={exchange.id}>
                        {exchange.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Key Name
                  </label>
                  <input 
                    type="text"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                    placeholder="E.g., Binance Main, Coinbase Trading"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    API Key
                  </label>
                  <input 
                    type="text"
                    value={newApiKey.key}
                    onChange={(e) => setNewApiKey({...newApiKey, key: e.target.value})}
                    placeholder="Enter your API key"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    API Secret
                  </label>
                  <input 
                    type="password"
                    value={newApiKey.secret}
                    onChange={(e) => setNewApiKey({...newApiKey, secret: e.target.value})}
                    placeholder="Enter your API secret"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="read-permission"
                          checked={newApiKey.permissions.read}
                          onCheckedChange={(checked) => 
                            setNewApiKey({
                              ...newApiKey, 
                              permissions: {...newApiKey.permissions, read: checked}
                            })
                          }
                        />
                        <label htmlFor="read-permission" className="text-sm text-white">
                          Read (View balances and transactions)
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="trade-permission"
                          checked={newApiKey.permissions.trade}
                          onCheckedChange={(checked) => 
                            setNewApiKey({
                              ...newApiKey, 
                              permissions: {...newApiKey.permissions, trade: checked}
                            })
                          }
                        />
                        <label htmlFor="trade-permission" className="text-sm text-white">
                          Trade (Place and cancel orders)
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="withdraw-permission"
                          checked={newApiKey.permissions.withdraw}
                          onCheckedChange={(checked) => 
                            setNewApiKey({
                              ...newApiKey, 
                              permissions: {...newApiKey.permissions, withdraw: checked}
                            })
                          }
                        />
                        <label htmlFor="withdraw-permission" className="text-sm text-white">
                          Withdraw (Transfer funds)
                        </label>
                      </div>
                      {newApiKey.permissions.withdraw && (
                        <span className="text-xs text-red-400">High Risk</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {newApiKey.permissions.withdraw && (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-xs text-red-300">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <p>
                        <span className="font-semibold">Warning:</span> Enabling withdrawal permissions grants this API key the ability to move funds out of your exchange account. Only enable if absolutely necessary.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddApiKeyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddApiKey}>
                    Add API Key
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Profile; 