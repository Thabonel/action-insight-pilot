
// Environment-aware CORS configuration for production security
const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

export const corsHeaders = {
  'Access-Control-Allow-Origin': isProduction ? 
    'https://wheels-wins-orchestrator.onrender.com,https://lovable.dev,https://app.lovable.dev' : 
    '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
