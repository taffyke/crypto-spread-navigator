
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle preflight OPTIONS request
function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
}

serve(async (req: Request) => {
  // Handle CORS
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get request body
    const { user_id, exchange_name, symbols } = await req.json();
    
    if (!user_id || !exchange_name || !symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching data for user ${user_id}, exchange: ${exchange_name}, symbols: ${symbols.join(',')}`);

    // Fetch the API key for this user and exchange
    const { data: apiKeys, error: apiKeyError } = await supabaseClient
      .from('exchange_api_keys')
      .select('*')
      .eq('user_id', user_id)
      .eq('exchange_name', exchange_name)
      .eq('is_active', true)
      .limit(1);

    if (apiKeyError) {
      throw apiKeyError;
    }

    if (!apiKeys || apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No API key found for this exchange' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const apiKey = apiKeys[0];

    // Update last_used_at timestamp
    await supabaseClient
      .from('exchange_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id);

    // Fetch market data for each symbol
    const results = await Promise.all(symbols.map(async (symbol: string) => {
      try {
        // Example for Binance, but this would need to be customized per exchange
        let url: string;
        let headers: Record<string, string> = {};
        
        switch (exchange_name) {
          case 'binance':
            url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.replace('/', '')}`;
            break;
          case 'coinbase':
            url = `https://api.exchange.coinbase.com/products/${symbol.replace('/', '-')}/ticker`;
            headers = {
              'CB-ACCESS-KEY': apiKey.api_key,
              'CB-ACCESS-SIGN': '', // Would need to generate signature
              'CB-ACCESS-TIMESTAMP': '', // Would need timestamp
              'CB-ACCESS-PASSPHRASE': apiKey.api_passphrase || '',
            };
            break;
          case 'kraken':
            url = `https://api.kraken.com/0/public/Ticker?pair=${symbol.replace('/', '')}`;
            break;
          case 'kucoin':
            url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol.replace('/', '-')}`;
            break;
          default:
            // For demo, just use a public API that doesn't need authentication
            url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.replace('/', '')}`;
        }
        
        const response = await fetch(url, { headers });
        const data = await response.json();

        // Process and normalize the data based on exchange format
        // This is simplified - in reality would need proper mapping per exchange
        let marketData;
        
        if (exchange_name === 'binance') {
          marketData = {
            exchange_name,
            symbol,
            price: parseFloat(data.lastPrice),
            bid_price: parseFloat(data.bidPrice),
            ask_price: parseFloat(data.askPrice),
            volume: parseFloat(data.volume),
            high_24h: parseFloat(data.highPrice),
            low_24h: parseFloat(data.lowPrice),
            change_percent_24h: parseFloat(data.priceChangePercent),
            timestamp: new Date().toISOString()
          };
        } else {
          // Generic/backup mapping - customize for each exchange
          marketData = {
            exchange_name,
            symbol,
            price: data.price || data.last || data.lastPrice || 0,
            bid_price: data.bid || data.bidPrice || 0,
            ask_price: data.ask || data.askPrice || 0,
            volume: data.volume || data.volume24h || 0,
            high_24h: data.high || data.highPrice || 0,
            low_24h: data.low || data.lowPrice || 0,
            change_percent_24h: data.changePercent || data.priceChangePercent || 0,
            timestamp: new Date().toISOString()
          };
        }
        
        // Store the fetched data in the database
        const { data: insertedData, error: insertError } = await supabaseClient
          .from('market_data')
          .insert(marketData)
          .select();
        
        if (insertError) {
          console.error('Error inserting market data:', insertError);
        }
        
        return marketData;
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return {
          exchange_name,
          symbol,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }));

    return new Response(
      JSON.stringify({ data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
