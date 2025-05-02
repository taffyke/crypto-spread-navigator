
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ApiKeysList from '@/components/api-keys/ApiKeysList';
import AddApiKeyForm from '@/components/api-keys/AddApiKeyForm';
import { LogOut, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingNewKey, setAddingNewKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        
        if (!session?.user) {
          router.push('/auth');
        }
      }
    );

    // Get session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
      
      if (!session?.user) {
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out Successfully",
        description: "You have been logged out.",
        variant: "default",
      });
      router.push('/auth');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">Authentication Required</h3>
            <p className="text-slate-400 mb-6">
              Please log in to access your account settings.
            </p>
            <Button onClick={() => router.push('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-1.5">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <div className="mb-8">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-slate-400 text-sm">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-sm">User ID</span>
                <code className="text-xs bg-slate-900 p-1 rounded font-mono">{user.id}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        {addingNewKey ? (
          <AddApiKeyForm onBack={() => setAddingNewKey(false)} />
        ) : (
          <ApiKeysList onAddNew={() => setAddingNewKey(true)} />
        )}
      </div>
    </div>
  );
}
