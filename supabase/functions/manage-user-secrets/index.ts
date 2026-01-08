
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// AES-GCM encryption utilities
async function generateKey(): Promise<CryptoKey> {
  const masterKeyString = Deno.env.get('SECRET_MASTER_KEY')
  if (!masterKeyString || masterKeyString.length !== 64) {
    throw new Error('Master key must be 64 hex characters (32 bytes)')
  }
  
  const keyBytes = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = parseInt(masterKeyString.substr(i * 2, 2), 16)
  }
  
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptSecret(plaintext: string): Promise<{ encryptedValue: string; iv: string }> {
  const key = await generateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedText = new TextEncoder().encode(plaintext)
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  )
  
  return {
    encryptedValue: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  }
}

async function decryptSecret(encryptedValue: string, iv: string): Promise<string> {
  const key = await generateKey()
  const encryptedData = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0))
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    key,
    encryptedData
  )
  
  return new TextDecoder().decode(decrypted)
}

async function logOperation(
  userId: string,
  serviceName: string,
  operation: string,
  success: boolean,
  errorMessage?: string,
  request?: Request
) {
  const ipAddress = request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'
  
  await supabase.from('secret_audit_logs').insert({
    user_id: userId,
    service_name: serviceName,
    operation,
    success,
    error_message: errorMessage,
    ip_address: ipAddress,
    user_agent: userAgent
  })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    switch (action) {
      case 'save': {
        const { serviceName, value } = await req.json()
        
        if (!serviceName || !value) {
          throw new Error('Service name and value are required')
        }

        const { encryptedValue, iv } = await encryptSecret(value)
        
        const { error } = await supabase
          .from('user_secrets')
          .upsert({
            user_id: user.id,
            service_name: serviceName,
            encrypted_value: encryptedValue,
            initialization_vector: iv,
            last_used_at: new Date().toISOString()
          })

        if (error) throw error

        await logOperation(user.id, serviceName, 'create', true, undefined, req)
        
        return new Response(
          JSON.stringify({ success: true, message: 'Secret saved successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list': {
        const { data, error } = await supabase
          .from('user_secrets')
          .select('service_name, created_at, updated_at, last_used_at, is_active, metadata')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (error) throw error

        return new Response(
          JSON.stringify({ secrets: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { serviceName } = await req.json()
        
        const { error } = await supabase
          .from('user_secrets')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('service_name', serviceName)

        if (error) throw error

        await logOperation(user.id, serviceName, 'delete', true, undefined, req)

        return new Response(
          JSON.stringify({ success: true, message: 'Secret deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get': {
        const serviceName = url.searchParams.get('serviceName')
        
        if (!serviceName) {
          throw new Error('Service name is required')
        }

        const { data, error } = await supabase
          .from('user_secrets')
          .select('encrypted_value, initialization_vector')
          .eq('user_id', user.id)
          .eq('service_name', serviceName)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          await logOperation(user.id, serviceName, 'read', false, 'Secret not found', req)
          throw new Error('Secret not found')
        }

        const decryptedValue = await decryptSecret(data.encrypted_value, data.initialization_vector)
        
        // Update last_used_at
        await supabase
          .from('user_secrets')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('service_name', serviceName)

        await logOperation(user.id, serviceName, 'read', true, undefined, req)

        return new Response(
          JSON.stringify({ value: decryptedValue }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error: unknown) {
    console.error('Error in manage-user-secrets:', error)
    
    // Map errors to generic user messages while logging details server-side
    let userMessage = 'An error occurred';
    
    if (error instanceof Error ? error.message : String(error)?.includes('Master key')) {
      userMessage = 'Configuration error';
    } else if (error instanceof Error ? error.message : String(error)?.includes('not found')) {
      userMessage = 'Secret not found';
    } else if (error instanceof Error ? error.message : String(error)?.includes('Invalid action')) {
      userMessage = 'Invalid request';
    } else if (error instanceof Error ? error.message : String(error)?.includes('Authentication')) {
      userMessage = 'Authentication required';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
