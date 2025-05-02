
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  exchange_name: string;
  label: string;
  api_key: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysList({ onAddNew }: { onAddNew: () => void }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApiKeys(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load API keys",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const toggleShowSecret = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    
    try {
      const { error } = await supabase
        .from('exchange_api_keys')
        .delete()
        .eq('id', keyToDelete);

      if (error) {
        throw error;
      }

      toast({
        title: "API Key Deleted",
        description: "Your exchange API key has been removed.",
        variant: "default",
      });
      
      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete));
    } catch (error: any) {
      toast({
        title: "Failed to delete API key",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setKeyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setKeyToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Function to mask API key for display
  const maskApiKey = (key: string) => {
    if (key.length <= 8) {
      return '•'.repeat(key.length);
    }
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  // Function to format the exchange name for display
  const formatExchangeName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Your API Keys</h2>
        <Button 
          onClick={onAddNew}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add New API Key</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">No API Keys Found</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              You haven't added any exchange API keys yet. Add your first API key to start fetching market data.
            </p>
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {apiKeys.map((apiKey) => (
            <Card 
              key={apiKey.id} 
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-750 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {formatExchangeName(apiKey.exchange_name)}
                      {apiKey.label && (
                        <span className="ml-2 text-sm text-slate-400">
                          ({apiKey.label})
                        </span>
                      )}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="text-slate-400 w-20">API Key:</span>
                        <code className="font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-200">
                          {showSecrets[apiKey.id] ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                        </code>
                        <button
                          onClick={() => toggleShowSecret(apiKey.id)}
                          className="ml-2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showSecrets[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">
                        Added: {new Date(apiKey.created_at).toLocaleDateString()}
                      </p>
                      {apiKey.last_used_at && (
                        <p className="text-xs text-slate-400">
                          Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(apiKey.id)}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will permanently delete this API key. You will need to re-add it if you want to use it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKey}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
