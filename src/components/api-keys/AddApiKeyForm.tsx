
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { EXCHANGE_CONFIGS } from '@/lib/exchanges/exchangeApi';

export default function AddApiKeyForm({ onBack }: { onBack: () => void }) {
  const [exchangeName, setExchangeName] = useState('');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [apiPassphrase, setApiPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const supportedExchanges = Object.values(EXCHANGE_CONFIGS).map(config => ({
    id: config.id,
    name: config.name
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is logged in first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add API keys');
      }

      // Insert the API key
      const { data, error } = await supabase
        .from('exchange_api_keys')
        .insert({
          user_id: user.id, // Add the user_id field
          exchange_name: exchangeName,
          label: label || null, // Use null if empty string
          api_key: apiKey,
          api_secret: apiSecret,
          api_passphrase: apiPassphrase || null, // Use null if empty string
        })
        .select('id');

      if (error) {
        throw error;
      }

      toast({
        title: "API Key Added Successfully",
        description: "Your exchange API key has been securely stored.",
        variant: "default",
      });

      // Reset form
      setExchangeName('');
      setLabel('');
      setApiKey('');
      setApiSecret('');
      setApiPassphrase('');
      
      // Go back to list view
      if (onBack) {
        onBack();
      }
    } catch (error: any) {
      toast({
        title: "Failed to add API key",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 text-slate-300"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to API Keys
      </Button>
      
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>Add Exchange API Key</CardTitle>
          <CardDescription className="text-slate-300">
            Securely store your exchange API keys to automate market data retrieval
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchange" className="text-slate-200">Exchange</Label>
              <Select
                value={exchangeName}
                onValueChange={setExchangeName}
                required
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  {supportedExchanges.map(exchange => (
                    <SelectItem key={exchange.id} value={exchange.id}>
                      {exchange.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="label" className="text-slate-200">Label (Optional)</Label>
              <Input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Main Account"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">A memorable name for this API key</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-slate-200">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret" className="text-slate-200">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API secret"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiPassphrase" className="text-slate-200">
                API Passphrase (Optional)
              </Label>
              <Input
                id="apiPassphrase"
                type="password"
                value={apiPassphrase}
                onChange={(e) => setApiPassphrase(e.target.value)}
                placeholder="Required for some exchanges (e.g., Coinbase, KuCoin)"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Only required for specific exchanges like Coinbase Pro or KuCoin
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add API Key'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
