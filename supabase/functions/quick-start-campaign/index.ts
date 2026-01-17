import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Structured logger for Edge Functions
const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, context ? JSON.stringify(context) : '');
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuickStartRequest {
  campaignName: string;
  campaignType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignName, campaignType = 'multi_channel' }: QuickStartRequest = await req.json();

    if (!campaignName || !campaignName.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logger.info('Creating quick start campaign', { userId: user.id, campaignName, campaignType });

    // Step 1: Create the campaign with minimal data (draft status)
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: campaignName.trim(),
        type: campaignType,
        channel: campaignType === 'email' ? 'email' : 'social',
        status: 'draft',
        created_by: user.id,
        description: `Campaign created via Quick Start Wizard`,
        total_budget: 0,
        budget_allocated: 0,
        budget_spent: 0,
        demographics: {},
        kpi_targets: {},
        budget_breakdown: {},
        compliance_checklist: {},
        content: {},
        settings: {},
        metrics: {
          reach: 0,
          conversion_rate: 0,
          impressions: 0,
          clicks: 0,
          engagement_rate: 0,
          cost_per_click: 0,
          cost_per_acquisition: 0,
          revenue_generated: 0
        }
      })
      .select()
      .single();

    if (campaignError) {
      logger.error('Campaign creation failed', { error: campaignError.message, userId: user.id, campaignName });
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create campaign: ${campaignError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logger.info('Campaign created', { campaignId: campaign.id, campaignName });

    // Step 2: Create the knowledge bucket linked to the campaign
    const { data: bucket, error: bucketError } = await supabase
      .from('knowledge_buckets')
      .insert({
        name: `${campaignName.trim()} - Documents`,
        bucket_type: 'campaign',
        campaign_id: campaign.id,
        created_by: user.id,
        description: 'Auto-created for campaign planning - upload product docs, brand guidelines, competitor analysis, etc.',
        metadata: {
          auto_created: true,
          created_via: 'quick_start_wizard',
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (bucketError) {
      logger.error('Knowledge bucket creation failed', { error: bucketError.message, campaignId: campaign.id, userId: user.id });
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create knowledge bucket: ${bucketError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logger.info('Knowledge bucket created', { bucketId: bucket.id, campaignId: campaign.id });

    // Return success with both created resources
    return new Response(
      JSON.stringify({
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status
        },
        bucket: {
          id: bucket.id,
          name: bucket.name,
          campaign_id: bucket.campaign_id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    logger.error('Quick start campaign failed', { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
