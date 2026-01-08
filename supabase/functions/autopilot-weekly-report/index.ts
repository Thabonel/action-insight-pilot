import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('📊 Generating weekly autopilot reports...');

    // Get all active autopilot users
    const { data: activeConfigs, error: configError } = await supabase
      .from('marketing_autopilot_config')
      .select('*, user_id')
      .eq('is_active', true);

    if (configError) throw configError;

    const reports = [];

    for (const config of activeConfigs || []) {
      try {
        const report = await generateWeeklyReport(supabase, config);
        reports.push(report);
      } catch (error: unknown) {
        console.error(`Error generating report for user ${config.user_id}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      reportsGenerated: reports.length,
      reports
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in autopilot-weekly-report:', error);
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface AutopilotConfig {
  id: string;
  user_id: string;
  [key: string]: unknown;
}

async function generateWeeklyReport(supabase: SupabaseClient, config: AutopilotConfig): Promise<unknown> {
  const userId = config.user_id;
  const weekStart = getMonday(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  console.log(`Generating report for user ${userId}: ${weekStart.toISOString()} - ${weekEnd.toISOString()}`);

  // Get user info
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData?.user?.email;

  // Get leads generated this week
  const { data: weekLeads } = await supabase
    .from('autopilot_lead_inbox')
    .select('*')
    .eq('user_id', userId)
    .gte('received_at', weekStart.toISOString())
    .lte('received_at', weekEnd.toISOString());

  const totalLeads = weekLeads?.length || 0;

  // Get campaign spend this week
  const { data: weekMetrics } = await supabase
    .from('campaign_metrics')
    .select('spend, conversions, revenue')
    .gte('metric_date', weekStart.toISOString())
    .lte('metric_date', weekEnd.toISOString())
    .in('campaign_id', await getAutopilotCampaignIds(supabase, userId));

  const totalSpend = weekMetrics?.reduce((sum: number, m: Record<string, unknown>) => sum + (Number(m.spend) || 0), 0) || 0;
  const totalConversions = weekMetrics?.reduce((sum: number, m: Record<string, unknown>) => sum + (Number(m.conversions) || 0), 0) || 0;
  const totalRevenue = weekMetrics?.reduce((sum: number, m: Record<string, unknown>) => sum + (Number(m.revenue) || 0), 0) || 0;

  const roi = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Get top performing channel
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('name, type, campaign_metrics(conversions)')
    .eq('created_by', userId)
    .eq('auto_managed', true)
    .eq('status', 'active');

  let topChannel = 'N/A';
  if (campaigns && campaigns.length > 0) {
    const channelPerformance = campaigns.map((c: Record<string, unknown>) => ({
      name: c.name as string,
      conversions: Array.isArray(c.campaign_metrics) ? (c.campaign_metrics as Record<string, unknown>[]).reduce((sum: number, m: Record<string, unknown>) => sum + (Number(m.conversions) || 0), 0) : 0
    }));
    channelPerformance.sort((a: { name: string; conversions: number }, b: { name: string; conversions: number }) => b.conversions - a.conversions);
    topChannel = channelPerformance[0]?.name || 'N/A';
  }

  // Get activity summary
  const { data: activities } = await supabase
    .from('autopilot_activity_log')
    .select('activity_type, activity_description')
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  const summary = {
    total_leads_generated: totalLeads,
    total_spend: parseFloat(totalSpend.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
    top_performing_channel: topChannel,
    ai_insights: {
      trend: totalLeads > 0 ? 'Growing' : 'Starting up',
      recommendation: totalLeads === 0
        ? 'Your autopilot is setting up campaigns. Leads should start coming in within 48 hours.'
        : totalLeads < 10
        ? 'Early stage - AI is optimizing targeting to improve lead flow.'
        : 'Campaigns are performing well. AI is continuously optimizing for better results.',
      top_activities: activities?.slice(0, 5).map((a: Record<string, unknown>) => a.activity_description as string) || []
    }
  };

  // Save report to database
  const { data: savedReport, error: saveError } = await supabase
    .from('autopilot_weekly_reports')
    .insert({
      user_id: userId,
      autopilot_config_id: config.id,
      week_start_date: weekStart.toISOString().split('T')[0],
      week_end_date: weekEnd.toISOString().split('T')[0],
      total_leads_generated: totalLeads,
      total_spend: totalSpend,
      roi: roi,
      top_performing_channel: topChannel,
      summary: summary,
      ai_insights: summary.ai_insights
    })
    .select()
    .single();

  if (saveError) {
    console.error('Error saving report:', saveError);
  }

  // TODO: Send email report to user
  // This would integrate with your email service
  console.log(`Report generated for ${userEmail}: ${totalLeads} leads, $${totalSpend} spent`);

  return {
    userId,
    userEmail,
    reportId: savedReport?.id,
    summary
  };
}

async function getAutopilotCampaignIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('campaigns')
    .select('id')
    .eq('created_by', userId)
    .eq('auto_managed', true);

  return data?.map((c: Record<string, unknown>) => c.id) || [];
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}
