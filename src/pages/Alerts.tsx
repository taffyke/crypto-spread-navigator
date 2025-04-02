import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Settings, 
  Edit, 
  Check, 
  AlertTriangle, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Volume2, 
  BellOff, 
  Zap,
  ArrowUpDown,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Alert interface
interface Alert {
  id: string;
  name: string;
  type: 'price' | 'volume' | 'volatility' | 'arbitrage' | 'news';
  asset: string;
  condition: 'above' | 'below' | 'crossing' | 'percent_change';
  value: number;
  triggered: boolean;
  enabled: boolean;
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    sound: boolean;
  };
  createdAt: Date;
  lastTriggered?: Date;
}

// Sample alert data
const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'BTC Price Above 70k',
    type: 'price',
    asset: 'BTC/USDT',
    condition: 'above',
    value: 70000,
    triggered: false,
    enabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: true,
      sound: true
    },
    createdAt: new Date('2024-01-15'),
    lastTriggered: undefined
  },
  {
    id: '2',
    name: 'ETH 5% Price Drop',
    type: 'price',
    asset: 'ETH/USDT',
    condition: 'percent_change',
    value: -5,
    triggered: true,
    enabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      sound: false
    },
    createdAt: new Date('2024-02-10'),
    lastTriggered: new Date('2024-03-15')
  },
  {
    id: '3',
    name: 'SOL Volume Spike',
    type: 'volume',
    asset: 'SOL/USDT',
    condition: 'above',
    value: 500000000,
    triggered: false,
    enabled: false,
    notifications: {
      email: false,
      browser: true,
      mobile: true,
      sound: true
    },
    createdAt: new Date('2024-03-01')
  },
  {
    id: '4',
    name: 'BTC-ETH Arbitrage 2%+',
    type: 'arbitrage',
    asset: 'BTC/ETH',
    condition: 'above',
    value: 2,
    triggered: false,
    enabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: true,
      sound: true
    },
    createdAt: new Date('2024-03-10')
  },
  {
    id: '5',
    name: 'BTC/USDT Volatility Alert',
    type: 'volatility',
    asset: 'BTC/USDT',
    condition: 'above',
    value: 4,
    triggered: true,
    enabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: true,
      sound: false
    },
    createdAt: new Date('2024-02-20'),
    lastTriggered: new Date('2024-03-18')
  }
];

// Available assets
const assets = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'AVAX/USDT', 'MATIC/USDT',
  'BTC/ETH', 'ETH/BTC', 'SOL/BTC', 'BNB/BTC'
];

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New alert form state
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id' | 'triggered' | 'createdAt'>>({
    name: '',
    type: 'price',
    asset: 'BTC/USDT',
    condition: 'above',
    value: 0,
    enabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      sound: false
    }
  });

  // Filter alerts based on active tab
  const filteredAlerts = activeTab === 'all' 
    ? alerts 
    : activeTab === 'active' 
      ? alerts.filter(alert => alert.enabled && !alert.triggered)
      : activeTab === 'triggered'
        ? alerts.filter(alert => alert.triggered)
        : alerts.filter(alert => !alert.enabled);

  // Handle alert toggle
  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, enabled: !alert.enabled } 
          : alert
      )
    );
    
    toast({
      title: 'Alert Status Updated',
      description: `Alert has been ${alerts.find(a => a.id === id)?.enabled ? 'disabled' : 'enabled'}.`,
      variant: 'default',
    });
  };

  // Handle alert deletion
  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    
    toast({
      title: 'Alert Deleted',
      description: 'The alert has been permanently removed.',
      variant: 'destructive',
    });
  };

  // Create new alert
  const createAlert = () => {
    if (!newAlert.name || !newAlert.asset || newAlert.value === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    const id = `alert-${Date.now()}`;
    const createdAlert: Alert = {
      ...newAlert,
      id,
      triggered: false,
      createdAt: new Date()
    };
    
    setAlerts(prev => [createdAlert, ...prev]);
    setShowCreateDialog(false);
    
    // Reset form
    setNewAlert({
      name: '',
      type: 'price',
      asset: 'BTC/USDT',
      condition: 'above',
      value: 0,
      enabled: true,
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        sound: false
      }
    });
    
    toast({
      title: 'Alert Created',
      description: 'Your new alert has been created successfully.',
      variant: 'default',
    });
  };

  // Simulate alert checking (would be replaced with real API calls)
  const checkAlerts = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // In a real app, this would check current market data against alert conditions
      const updatedAlerts = alerts.map(alert => {
        // Simulate random triggering for demo purposes
        if (alert.enabled && !alert.triggered && Math.random() > 0.7) {
          return { 
            ...alert, 
            triggered: true,
            lastTriggered: new Date()
          };
        }
        return alert;
      });
      
      setAlerts(updatedAlerts);
      setIsLoading(false);
      
      toast({
        title: 'Alerts Checked',
        description: 'All alerts have been checked against current market data.',
        variant: 'default',
      });
    }, 1500);
  };

  // Reset triggered alerts
  const resetTriggeredAlerts = () => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.triggered 
          ? { ...alert, triggered: false, lastTriggered: undefined } 
          : alert
      )
    );
    
    toast({
      title: 'Alerts Reset',
      description: 'All triggered alerts have been reset.',
      variant: 'default',
    });
  };

  // Alert type to icon mapping
  const alertTypeIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <ArrowUpDown className="h-4 w-4 text-blue-400" />;
      case 'volume':
        return <Volume2 className="h-4 w-4 text-purple-400" />;
      case 'volatility':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'arbitrage':
        return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'news':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  // Condition to text mapping
  const conditionText = (condition: string, value: number) => {
    switch (condition) {
      case 'above':
        return `Above ${value.toLocaleString()}`;
      case 'below':
        return `Below ${value.toLocaleString()}`;
      case 'crossing':
        return `Crossing ${value.toLocaleString()}`;
      case 'percent_change':
        return `${value >= 0 ? '+' : ''}${value}% Change`;
      default:
        return `${value}`;
    }
  };

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Alert Configuration</h1>
        <p className="text-sm md:text-base text-slate-400">
          Set up customized alerts for price movements, trading volume, and arbitrage opportunities
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="text-lg font-medium text-white">Your Alerts</h2>
            <span className="text-xs text-slate-400">
              {alerts.filter(a => a.enabled).length} active, 
              {alerts.filter(a => a.triggered).length} triggered
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs flex items-center gap-1.5"
            onClick={resetTriggeredAlerts}
            disabled={!alerts.some(a => a.triggered)}
          >
            <Clock className="h-3.5 w-3.5" />
            Reset Triggered
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs flex items-center gap-1.5"
            onClick={checkAlerts}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Check Alerts
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-1.5"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Alert
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-800 border border-slate-700 p-1">
          <TabsTrigger 
            value="all" 
            className={`${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            All Alerts
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className={`${activeTab === 'active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="triggered" 
            className={`${activeTab === 'triggered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Triggered
          </TabsTrigger>
          <TabsTrigger 
            value="disabled" 
            className={`${activeTab === 'disabled' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Disabled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <BellOff className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-slate-300 text-lg font-medium mb-2">No Alerts Found</h3>
              <p className="text-slate-400 text-sm mb-4">
                {activeTab === 'all' 
                  ? "You haven't created any alerts yet." 
                  : activeTab === 'active' 
                    ? "You don't have any active alerts." 
                    : activeTab === 'triggered' 
                      ? "No alerts have been triggered yet."
                      : "You don't have any disabled alerts."}
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-500"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={cn(
                    "bg-slate-800 border rounded-lg p-4 transition-colors",
                    alert.triggered 
                      ? "border-yellow-500/50 bg-yellow-500/5" 
                      : alert.enabled 
                        ? "border-blue-500/50 bg-blue-500/5" 
                        : "border-slate-700"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 p-1.5 rounded-full",
                        alert.triggered 
                          ? "bg-yellow-500/20" 
                          : alert.enabled 
                            ? "bg-blue-500/20" 
                            : "bg-slate-700"
                      )}>
                        {alertTypeIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{alert.name}</h3>
                          {alert.triggered && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-sm">
                              Triggered
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-300 mb-1 flex items-center gap-2">
                          <span className="font-semibold">{alert.asset}</span> 
                          <span className="text-slate-400">•</span>
                          <span>{conditionText(alert.condition, alert.value)}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created: {formatDate(alert.createdAt)}
                          </div>
                          
                          {alert.lastTriggered && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-400" />
                              Last triggered: {formatDate(alert.lastTriggered)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs text-slate-400">
                          {alert.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch 
                          checked={alert.enabled} 
                          onCheckedChange={() => toggleAlert(alert.id)}
                          className={alert.enabled ? "bg-blue-600" : ""}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                          onClick={() => toast({
                            title: "Edit Alert",
                            description: "Alert editing will be available soon.",
                          })}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap items-center gap-3">
                    <div className="text-xs text-slate-400">Notifications:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        alert.notifications.email
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-400"
                      )}>
                        Email
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        alert.notifications.browser
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-400"
                      )}>
                        Browser
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        alert.notifications.mobile
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-400"
                      )}>
                        Mobile
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        alert.notifications.sound
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-400"
                      )}>
                        Sound
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Alert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure an alert for price, volume, or other market conditions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Alert Name</label>
              <Input 
                placeholder="Enter alert name" 
                className="bg-slate-700 border-slate-600 text-white"
                value={newAlert.name}
                onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Alert Type</label>
                <Select 
                  value={newAlert.type} 
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="price">Price Alert</SelectItem>
                    <SelectItem value="volume">Volume Alert</SelectItem>
                    <SelectItem value="volatility">Volatility Alert</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage Alert</SelectItem>
                    <SelectItem value="news">News Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Asset</label>
                <Select 
                  value={newAlert.asset} 
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, asset: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {assets.map(asset => (
                      <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Condition</label>
                <Select 
                  value={newAlert.condition} 
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="above">Price Above</SelectItem>
                    <SelectItem value="below">Price Below</SelectItem>
                    <SelectItem value="crossing">Price Crossing</SelectItem>
                    <SelectItem value="percent_change">Percent Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Value</label>
                <Input 
                  type="number" 
                  placeholder="Enter value" 
                  className="bg-slate-700 border-slate-600 text-white"
                  value={newAlert.value === 0 ? '' : newAlert.value}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Notification Methods</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400 cursor-pointer">Email Notifications</label>
                  <Switch 
                    checked={newAlert.notifications.email}
                    onCheckedChange={(checked) => 
                      setNewAlert(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, email: checked } 
                      }))}
                    className={newAlert.notifications.email ? "bg-blue-600" : ""}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400 cursor-pointer">Browser Notifications</label>
                  <Switch 
                    checked={newAlert.notifications.browser}
                    onCheckedChange={(checked) => 
                      setNewAlert(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, browser: checked } 
                      }))}
                    className={newAlert.notifications.browser ? "bg-blue-600" : ""}  
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400 cursor-pointer">Mobile Notifications</label>
                  <Switch 
                    checked={newAlert.notifications.mobile}
                    onCheckedChange={(checked) => 
                      setNewAlert(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, mobile: checked } 
                      }))}
                    className={newAlert.notifications.mobile ? "bg-blue-600" : ""} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400 cursor-pointer">Sound Alerts</label>
                  <Switch 
                    checked={newAlert.notifications.sound}
                    onCheckedChange={(checked) => 
                      setNewAlert(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, sound: checked } 
                      }))}
                    className={newAlert.notifications.sound ? "bg-blue-600" : ""} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={createAlert}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alerts; 