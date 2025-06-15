
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple decryption for tokens (in production, use proper encryption)
function decryptToken(encryptedToken: string): string {
  const key = Deno.env.get('SECRET_MASTER_KEY') || 'default-key'
  try {
    const decoded = atob(encryptedToken)
    const [tokenKey, ...tokenParts] = decoded.split(':')
    if (tokenKey === key) {
      return tokenParts.join(':')
    }
    throw new Error('Invalid token encryption')
  } catch {
    throw new Error('Failed to decrypt token')
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get all connections for the user
      const { data: connections, error } = await supabase
        .from('oauth_connections')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch connections' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Transform for frontend (don't expose encrypted tokens)
      const transformedConnections = connections.map(conn => ({
        id: conn.id,
        user_id: conn.user_id,
        platform_name: conn.platform_name,
        connection_status: conn.connection_status,
        platform_user_id: conn.platform_user_id,
        platform_username: conn.platform_username,
        connection_metadata: conn.connection_metadata,
        created_at: conn.created_at,
        updated_at: conn.updated_at,
        token_expires_at: conn.token_expires_at
      }))

      return new Response(
        JSON.stringify({ success: true, data: transformedConnections }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      // Disconnect a platform
      const url = new URL(req.url)
      const platform = url.pathname.split('/').pop()

      if (!platform) {
        return new Response(
          JSON.stringify({ error: 'Platform not specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('oauth_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform_name', platform)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to disconnect platform' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: { platform, status: 'disconnected' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Social connections error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
