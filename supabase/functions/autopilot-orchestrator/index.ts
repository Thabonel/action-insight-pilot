import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('🤖 Autopilot Orchestrator: Starting daily optimization cycle...');

    // Get all active autopilot configurations
    const { data: activeConfigs, error: configError } = await supabase
      .from('marketing_autopilot_config')
      .select('*')
      .eq('is_active', true);

    if (configError) throw configError;

    console.log(`Found ${activeConfigs?.length || 0} active autopilot users`);

    const results = [];

    // Process each user's autopilot
    for (const config of activeConfigs || []) {
      try {
        const result = await processAutopilot(supabase, config);
        results.push(result);
      } catch (error) {
        console.error(`Error processing autopilot for user ${config.user_id}:`, error);
        results.push({
          userId: config.user_id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in autopilot-orchestrator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAutopilot(supabase: any, config: any) {
  const userId = config.user_id;
  const configId = config.id;

  console.log(`Processing autopilot for user: ${userId}`);

  // Step 1: Check if we need to create initial campaigns
  const { data: existingCampaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('created_by', userId)
    .eq('auto_managed', true);

  const hasActiveCampaigns = existingCampaigns && existingCampaigns.length > 0;

  if (!hasActiveCampaigns) {
    console.log('No campaigns found. Creating initial campaigns...');
    await createInitialCampaigns(supabase, userId, configId, config);
  } else {
    console.log(`Found ${existingCampaigns.length} existing campaigns. Optimizing...`);
    await optimizeCampaigns(supabase, userId, configId);
  }

  // Step 2: Sync leads to autopilot inbox
  await syncLeadsToInbox(supabase, userId);

  // Step 3: Update last optimized timestamp
  await supabase
    .from('marketing_autopilot_config')
    .update({ last_optimized_at: new Date().toISOString() })
    .eq('id', configId);

  return {
    userId,
    success: true,
    action: hasActiveCampaigns ? 'optimized' : 'created_campaigns'
  };
}

async function createInitialCampaigns(supabase: any, userId: string, configId: string, config: any) {
  const strategy = config.ai_strategy;

  if (!strategy?.channels || !Array.isArray(strategy.channels)) {
    console.error('Invalid strategy format, skipping campaign creation');
    return;
  }

  // Create campaigns based on AI strategy
  for (const channel of strategy.channels) {
    const channelBudget = (config.monthly_budget * channel.budgetPercentage) / 100;

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        created_by: userId,
        name: `${channel.name} - Autopilot`,
        description: channel.rationale,
        type: mapChannelToType(channel.name),
        status: 'active',
        total_budget: channelBudget,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        auto_managed: true,
        metadata: {
          autopilot_config_id: configId,
          channel_strategy: channel
        }
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      continue;
    }

    console.log(`Created campaign: ${campaign.name}`);

    // Log activity
    await supabase.rpc('log_autopilot_activity', {
      p_user_id: userId,
      p_config_id: configId,
      p_activity_type: 'campaign_created',
      p_description: `Created ${channel.name} campaign with $${channelBudget.toFixed(2)} budget`,
      p_entity_type: 'campaign',
      p_entity_id: campaign.id,
      p_metadata: { channel: channel.name, budget: channelBudget }
    });

    // Create initial campaign tasks
    await createCampaignTasks(supabase, campaign.id, userId, channel);
  }
}

async function createCampaignTasks(supabase: any, campaignId: string, userId: string, channel: any) {
  const tasks = [
    {
      campaign_id: campaignId,
      created_by: userId,
      title: 'Set up targeting',
      description: `Configure ${channel.name} targeting based on audience insights`,
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    },
    {
      campaign_id: campaignId,
      created_by: userId,
      title: 'Create ad content',
      description: `Generate ad copy and creative for ${channel.name}`,
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      campaign_id: campaignId,
      created_by: userId,
      title: 'Launch campaign',
      description: `Activate ${channel.name} campaign`,
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error } = await supabase
    .from('campaign_tasks')
    .insert(tasks);

  if (error) {
    console.error('Error creating campaign tasks:', error);
  }
}

async function optimizeCampaigns(supabase: any, userId: string, configId: string) {
  // Get user's active campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, campaign_metrics(*)')
    .eq('created_by', userId)
    .eq('auto_managed', true)
    .eq('status', 'active');

  if (!campaigns || campaigns.length === 0) return;

  for (const campaign of campaigns) {
    // Get recent metrics
    const recentMetrics = campaign.campaign_metrics
      ?.sort((a: any, b: any) => new Date(b.metric_date).getTime() - new Date(a.metric_date).getTime())
      .slice(0, 7); // Last 7 days

    if (!recentMetrics || recentMetrics.length === 0) {
      console.log(`No metrics for campaign ${campaign.id}, skipping optimization`);
      continue;
    }

    // Calculate performance
    const avgConversionRate = recentMetrics.reduce((sum: number, m: any) =>
      sum + (m.conversion_rate || 0), 0) / recentMetrics.length;
    const totalSpend = recentMetrics.reduce((sum: number, m: any) =>
      sum + (m.spend || 0), 0);
    const totalConversions = recentMetrics.reduce((sum: number, m: any) =>
      sum + (m.conversions || 0), 0);

    // Optimization logic
    let optimizationAction = null;

    if (avgConversionRate < 1.0 && totalSpend > campaign.total_budget * 0.5) {
      // Underperforming - reduce budget
      optimizationAction = {
        type: 'budget_reduction',
        oldBudget: campaign.total_budget,
        newBudget: campaign.total_budget * 0.8,
        reason: 'Low conversion rate with high spend'
      };

      await supabase
        .from('campaigns')
        .update({ total_budget: optimizationAction.newBudget })
        .eq('id', campaign.id);

    } else if (avgConversionRate > 3.0 && totalSpend < campaign.total_budget * 0.7) {
      // High performer - increase budget
      optimizationAction = {
        type: 'budget_increase',
        oldBudget: campaign.total_budget,
        newBudget: Math.min(campaign.total_budget * 1.2, campaign.total_budget + 500),
        reason: 'High conversion rate with budget remaining'
      };

      await supabase
        .from('campaigns')
        .update({ total_budget: optimizationAction.newBudget })
        .eq('id', campaign.id);
    }

    if (optimizationAction) {
      console.log(`Optimized campaign ${campaign.id}:`, optimizationAction.type);

      // Log activity
      await supabase.rpc('log_autopilot_activity', {
        p_user_id: userId,
        p_config_id: configId,
        p_activity_type: 'budget_adjusted',
        p_description: `Adjusted ${campaign.name} budget from $${optimizationAction.oldBudget.toFixed(2)} to $${optimizationAction.newBudget.toFixed(2)}`,
        p_entity_type: 'campaign',
        p_entity_id: campaign.id,
        p_metadata: optimizationAction
      });
    }
  }
}

async function syncLeadsToInbox(supabase: any, userId: string) {
  // Get recent leads not yet in autopilot inbox
  const { data: newLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('created_by', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    .order('created_at', { ascending: false });

  if (!newLeads || newLeads.length === 0) return;

  // Check which leads are already in inbox
  const { data: existingInboxLeads } = await supabase
    .from('autopilot_lead_inbox')
    .select('lead_id')
    .eq('user_id', userId);

  const existingLeadIds = new Set(existingInboxLeads?.map((l: any) => l.lead_id) || []);

  // Add new leads to inbox
  const leadsToAdd = newLeads
    .filter(lead => !existingLeadIds.has(lead.id))
    .map(lead => ({
      user_id: userId,
      lead_id: lead.id,
      full_name: lead.full_name,
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      score: lead.score,
      status: 'new',
      received_at: lead.created_at
    }));

  if (leadsToAdd.length > 0) {
    const { error } = await supabase
      .from('autopilot_lead_inbox')
      .insert(leadsToAdd);

    if (!error) {
      console.log(`Synced ${leadsToAdd.length} new leads to inbox`);
    }
  }
}

function mapChannelToType(channelName: string): string {
  const mapping: { [key: string]: string } = {
    'email': 'email',
    'social media': 'social',
    'social': 'social',
    'linkedin': 'social',
    'facebook': 'social',
    'instagram': 'social',
    'twitter': 'social',
    'content marketing': 'content',
    'content': 'content',
    'blog': 'content',
    'seo': 'content',
    'paid search': 'paid_ads',
    'google ads': 'paid_ads',
    'ppc': 'paid_ads',
    'display ads': 'paid_ads'
  };

  const normalized = channelName.toLowerCase();
  return mapping[normalized] || 'other';
}
