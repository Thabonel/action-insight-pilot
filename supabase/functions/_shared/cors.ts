
// Environment-aware CORS configuration for production security
const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

const allowedOrigins = [
  'https://aiboostcampaign.com',
  'https://wheels-wins-orchestrator.onrender.com',
  'https://lovable.dev',
  'https://app.lovable.dev',
  'http://localhost:5173',
  'http://localhost:3000'
];

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : (isProduction ? allowedOrigins[0] : '*');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  };
}

// Backward compatibility - default headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
