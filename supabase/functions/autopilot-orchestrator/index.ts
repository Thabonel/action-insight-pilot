import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
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

  // Step 3: Process assessment-based workflows
  await processAssessmentWorkflows(supabase, userId, configId);

  // Step 4: Update last optimized timestamp
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

    // Create assessment for lead capture
    await createCampaignAssessment(supabase, userId, campaign.id, configId, config);

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

async function createCampaignAssessment(supabase: any, userId: string, campaignId: string, configId: string, config: any) {
  try {
    console.log(`Generating assessment for campaign ${campaignId}...`);

    // Extract business info from autopilot config
    const businessDescription = config.business_description || '';
    const targetAudience = config.ai_strategy?.targetAudience || config.target_audience || 'potential customers';
    const businessType = config.business_type || 'business';

    // Call assessment-generator Edge Function
    const { data: assessmentData, error: genError } = await supabase.functions.invoke('assessment-generator', {
      body: {
        business_type: businessType,
        target_audience: targetAudience,
        product_offer: businessDescription,
        assessment_goal: 'Qualify leads and identify their readiness to buy',
        campaign_id: campaignId
      }
    });

    if (genError) {
      console.error('Assessment generation error:', genError);
      return;
    }

    if (!assessmentData?.success) {
      console.error('Assessment generation failed:', assessmentData?.error);
      return;
    }

    const assessment = assessmentData.assessment;
    const assessmentId = assessmentData.assessment_id;

    console.log(`Assessment generated: ${assessmentId}`);

    // Update campaign metadata with assessment URL
    await supabase
      .from('campaigns')
      .update({
        metadata: {
          ...config.metadata,
          assessment_id: assessmentId,
          assessment_url: `/a/${assessmentId}`
        }
      })
      .eq('id', campaignId);

    // Log activity
    await supabase.rpc('log_autopilot_activity', {
      p_user_id: userId,
      p_config_id: configId,
      p_activity_type: 'assessment_created',
      p_description: `Auto-generated assessment for lead capture: ${assessment.headline}`,
      p_entity_type: 'campaign',
      p_entity_id: campaignId,
      p_metadata: {
        assessment_id: assessmentId,
        question_count: assessment.questions?.length || 0
      }
    });

    console.log(`Assessment linked to campaign. URL: /a/${assessmentId}`);

  } catch (error) {
    console.error(`Error creating assessment for campaign ${campaignId}:`, error);
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

    // NEW: Check if video ads would improve engagement
    const avgEngagement = recentMetrics.reduce((sum: number, m: any) =>
      sum + (m.engagement_rate || 0), 0) / recentMetrics.length;

    if (avgEngagement < 2.0 && shouldGenerateVideoAds(campaign)) {
      console.log(`Low engagement (${avgEngagement.toFixed(2)}%) for campaign ${campaign.id}. Trying video ads...`);
      await tryGenerateVideoAds(supabase, userId, campaign, configId);
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

async function processAssessmentWorkflows(supabase: any, userId: string, configId: string) {
  try {
    // Get recent assessment responses (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentResponses } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        assessment_templates(user_id),
        leads(id, email, full_name, tags, score)
      `)
      .eq('assessment_templates.user_id', userId)
      .gte('submitted_at', weekAgo)
      .order('submitted_at', { ascending: false });

    if (!recentResponses || recentResponses.length === 0) return;

    console.log(`Processing ${recentResponses.length} recent assessment responses`);

    for (const response of recentResponses) {
      const lead = response.leads;
      if (!lead) continue;

      const score = response.score;
      const category = response.result_category;

      // Apply score-based tags
      let newTags = lead.tags || [];

      if (score >= 75) {
        // High score - ready to buy
        if (!newTags.includes('high_intent')) newTags.push('high_intent');
        if (!newTags.includes('qualified')) newTags.push('qualified');

        // Log high-value lead
        await supabase.rpc('log_autopilot_activity', {
          p_user_id: userId,
          p_config_id: configId,
          p_activity_type: 'high_score_lead',
          p_description: `High-intent lead captured: ${lead.email} (score: ${score})`,
          p_entity_type: 'lead',
          p_entity_id: lead.id,
          p_metadata: {
            score,
            category,
            assessment_id: response.assessment_id
          }
        });

      } else if (score >= 50) {
        // Medium score - needs nurturing
        if (!newTags.includes('nurture')) newTags.push('nurture');
        if (!newTags.includes('interested')) newTags.push('interested');

      } else {
        // Low score - long-term prospect
        if (!newTags.includes('education_track')) newTags.push('education_track');
        if (!newTags.includes('early_stage')) newTags.push('early_stage');
      }

      // Update lead with tags
      await supabase
        .from('leads')
        .update({
          tags: newTags,
          score: Math.max(lead.score || 0, score)
        })
        .eq('id', lead.id);

      // Update inbox status based on score
      const inboxStatus = score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold';

      await supabase
        .from('autopilot_lead_inbox')
        .update({ status: inboxStatus })
        .eq('lead_id', lead.id)
        .eq('user_id', userId);
    }

    console.log(`Processed assessment workflows for ${recentResponses.length} leads`);

  } catch (error) {
    console.error('Error processing assessment workflows:', error);
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

// ============================================================================
// VIDEO GENERATION FUNCTIONS
// ============================================================================

function shouldGenerateVideoAds(campaign: any): boolean {
  // Only generate for video-friendly channels
  const videoChannels = ['LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Instagram', 'social'];
  const campaignName = campaign.name?.toLowerCase() || '';
  const isVideoChannel = videoChannels.some(channel =>
    campaignName.includes(channel.toLowerCase())
  );

  if (!isVideoChannel) return false;

  // Check if budget allows (estimate $3.20 for 8-second video with Veo Fast)
  const estimatedCost = 3.20;
  const remainingBudget = campaign.total_budget - (campaign.spent || 0);

  return remainingBudget >= estimatedCost;
}

async function tryGenerateVideoAds(supabase: any, userId: string, campaign: any, configId: string) {
  try {
    // Check if user has Gemini API key
    const { data: apiKeys } = await supabase
      .from('user_api_keys')
      .select('gemini_api_key_encrypted')
      .eq('user_id', userId)
      .single();

    if (!apiKeys?.gemini_api_key_encrypted) {
      console.log(`User ${userId} missing Gemini API key. Skipping video generation.`);
      return;
    }

    // Check rate limit: max 5 videos per campaign per week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentVideos } = await supabase
      .from('ai_video_projects')
      .select('id')
      .eq('user_id', userId)
      .eq('campaign_id', campaign.id)
      .eq('auto_generated', true)
      .gte('created_at', weekAgo);

    if (recentVideos && recentVideos.length >= 5) {
      console.log(`Already generated 5 videos this week for campaign ${campaign.id}. Skipping.`);
      return;
    }

    // Get autopilot config for brand info
    const { data: config } = await supabase
      .from('marketing_autopilot_config')
      .select('*')
      .eq('id', configId)
      .single();

    // Call backend AI video generation endpoint
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://wheels-wins-orchestrator.onrender.com';

    const response = await fetch(`${backendUrl}/ai-video/autopilot-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        campaign_id: campaign.id,
        goal: `Create engaging video ad for ${campaign.name}. Campaign description: ${campaign.description}`,
        platform: determinePlatform(campaign.name),
        duration_s: 8,
        brand_kit: {
          primary_color: config?.brand_kit?.primary_color || '#FF5722',
          secondary_color: config?.brand_kit?.secondary_color || '#FFC107',
          logo_url: config?.brand_kit?.logo_url || '',
          font_family: 'Inter'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Video generation failed for campaign ${campaign.id}:`, error);
      return;
    }

    const result = await response.json();

    if (result.status === 'skipped') {
      console.log(`Video generation skipped: ${result.reason}`);
      return;
    }

    console.log(`✅ Started video generation for campaign ${campaign.id}. Project ID: ${result.project_id}`);

    // Log activity
    await supabase.rpc('log_autopilot_activity', {
      p_user_id: userId,
      p_config_id: configId,
      p_activity_type: 'video_generation',
      p_description: `Auto-generating video ad for ${campaign.name} to boost engagement`,
      p_entity_type: 'campaign',
      p_entity_id: campaign.id,
      p_metadata: {
        project_id: result.project_id,
        estimated_cost: result.estimated_cost || 3.20
      }
    });

  } catch (error) {
    console.error(`Error in tryGenerateVideoAds for campaign ${campaign.id}:`, error);
  }
}

function determinePlatform(campaignName: string): string {
  const name = campaignName.toLowerCase();

  if (name.includes('youtube')) return 'YouTubeShort';
  if (name.includes('tiktok')) return 'TikTok';
  if (name.includes('instagram') || name.includes('reels')) return 'Reels';
  if (name.includes('linkedin') || name.includes('facebook')) return 'YouTubeShort'; // Vertical format

  return 'YouTubeShort'; // Default to vertical
}
