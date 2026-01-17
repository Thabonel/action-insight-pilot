import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['get_optimal_times', 'schedule_content', 'record_engagement', 'get_checklist']),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'youtube', 'tiktok', 'blog', 'newsletter', 'reddit', 'facebook']),
  contentId: z.string().uuid().optional(),
  scheduledTime: z.string().datetime().optional(),
  engagementData: z.object({
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    clicks: z.number().optional(),
    impressions: z.number().optional(),
  }).optional(),
  timezone: z.string().optional(),
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

const DEFAULT_GOLDEN_HOURS: Record<string, { days: number[], hours: number[] }> = {
  linkedin: { days: [1, 2, 3, 4], hours: [7, 8, 12, 17, 18] },
  twitter: { days: [1, 2, 3, 4, 5], hours: [8, 9, 12, 17, 18, 19] },
  instagram: { days: [1, 2, 3, 4, 5, 6, 0], hours: [11, 12, 13, 19, 20, 21] },
  youtube: { days: [4, 5, 6], hours: [12, 13, 14, 15, 16] },
  tiktok: { days: [1, 2, 3, 4, 5, 6, 0], hours: [7, 8, 12, 15, 19, 20, 21, 22] },
  blog: { days: [1, 2, 3], hours: [9, 10, 11] },
  newsletter: { days: [2, 3, 4], hours: [9, 10, 14] },
  reddit: { days: [0, 1, 2, 3, 4, 5, 6], hours: [6, 7, 8, 9, 10] },
  facebook: { days: [3, 4, 5], hours: [9, 11, 12, 13, 14] },
};

const GOLDEN_HOUR_CHECKLIST = [
  { task: 'Be online and ready to respond', timing: 'At publish time', priority: 'critical' },
  { task: 'Respond to EVERY comment within 15 minutes', timing: 'First 60 minutes', priority: 'critical' },
  { task: 'Ask follow-up questions to commenters', timing: 'First 60 minutes', priority: 'high' },
  { task: 'Share to relevant communities/groups', timing: 'First 30 minutes', priority: 'high' },
  { task: 'Engage with similar content from others', timing: 'First 60 minutes', priority: 'medium' },
  { task: 'DM people who engaged meaningfully', timing: 'After 60 minutes', priority: 'medium' },
  { task: 'Note what resonated for future content', timing: 'After 60 minutes', priority: 'low' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const requestBody = await req.json();
    const validation = RequestSchema.safeParse(requestBody);

    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return jsonResponse({
        success: false,
        error: 'Invalid request parameters',
        details: validation.error.issues
      }, 400);
    }

    const input = validation.data;
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    switch (input.action) {
      case 'get_optimal_times': {
        const { data: userAnalytics } = await supabase
          .from('golden_hour_analytics')
          .select('*')
          .eq('user_id', input.userId)
          .eq('platform', input.platform)
          .eq('is_golden_hour', true)
          .order('avg_engagement', { ascending: false });

        let optimalTimes;
        if (userAnalytics && userAnalytics.length > 0) {
          optimalTimes = userAnalytics.map(a => ({
            dayOfWeek: a.day_of_week,
            hour: a.hour_slot,
            avgEngagement: a.avg_engagement,
            sampleCount: a.sample_count,
            source: 'learned'
          }));
        } else {
          const defaults = DEFAULT_GOLDEN_HOURS[input.platform];
          optimalTimes = defaults.days.flatMap(day =>
            defaults.hours.map(hour => ({
              dayOfWeek: day,
              hour,
              avgEngagement: null,
              sampleCount: 0,
              source: 'default'
            }))
          ).slice(0, 10);
        }

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedTimes = optimalTimes.map(t => ({
          ...t,
          dayName: dayNames[t.dayOfWeek],
          formattedHour: `${t.hour}:00`
        }));

        return jsonResponse({
          success: true,
          platform: input.platform,
          optimalTimes: formattedTimes,
          message: userAnalytics?.length ? 'Times based on your engagement data' : 'Default times - will improve as you post'
        });
      }

      case 'schedule_content': {
        if (!input.contentId || !input.scheduledTime) {
          return jsonResponse({
            success: false,
            error: 'contentId and scheduledTime are required for scheduling'
          }, 400);
        }

        const scheduledDate = new Date(input.scheduledTime);
        const dayOfWeek = scheduledDate.getUTCDay();
        const hour = scheduledDate.getUTCHours();

        const defaults = DEFAULT_GOLDEN_HOURS[input.platform];
        const isGoldenHour = defaults.days.includes(dayOfWeek) && defaults.hours.includes(hour);

        const { error: updateError } = await supabase
          .from('content_pieces')
          .update({
            scheduled_for: input.scheduledTime,
            status: 'scheduled'
          })
          .eq('id', input.contentId)
          .eq('user_id', input.userId);

        if (updateError) {
          throw new Error(`Failed to schedule content: ${updateError.message}`);
        }

        return jsonResponse({
          success: true,
          contentId: input.contentId,
          scheduledFor: input.scheduledTime,
          isGoldenHour,
          checklist: isGoldenHour ? GOLDEN_HOUR_CHECKLIST : [],
          message: isGoldenHour
            ? 'Scheduled during Golden Hour - be ready to engage!'
            : 'Scheduled outside Golden Hour - consider a better time for maximum engagement'
        });
      }

      case 'record_engagement': {
        if (!input.contentId || !input.engagementData) {
          return jsonResponse({
            success: false,
            error: 'contentId and engagementData are required'
          }, 400);
        }

        const { data: content } = await supabase
          .from('content_pieces')
          .select('published_at')
          .eq('id', input.contentId)
          .eq('user_id', input.userId)
          .single();

        if (!content?.published_at) {
          return jsonResponse({
            success: false,
            error: 'Content has not been published yet'
          }, 400);
        }

        const publishedDate = new Date(content.published_at);
        const dayOfWeek = publishedDate.getUTCDay();
        const hour = publishedDate.getUTCHours();

        const totalEngagement =
          (input.engagementData.likes || 0) +
          (input.engagementData.comments || 0) * 3 +
          (input.engagementData.shares || 0) * 5 +
          (input.engagementData.clicks || 0) * 2;

        const { error: upsertError } = await supabase
          .from('golden_hour_analytics')
          .upsert({
            user_id: input.userId,
            platform: input.platform,
            day_of_week: dayOfWeek,
            hour_slot: hour,
            avg_engagement: totalEngagement,
            sample_count: 1,
            is_golden_hour: totalEngagement > 50
          }, {
            onConflict: 'user_id,platform,day_of_week,hour_slot'
          });

        if (upsertError) {
          console.error('Error updating analytics:', upsertError);
        }

        await supabase
          .from('content_pieces')
          .update({
            engagement_metrics: input.engagementData
          })
          .eq('id', input.contentId)
          .eq('user_id', input.userId);

        return jsonResponse({
          success: true,
          engagementScore: totalEngagement,
          message: 'Engagement recorded and analytics updated'
        });
      }

      case 'get_checklist': {
        return jsonResponse({
          success: true,
          platform: input.platform,
          checklist: GOLDEN_HOUR_CHECKLIST,
          message: 'Golden Hour engagement checklist'
        });
      }

      default:
        return jsonResponse({
          success: false,
          error: 'Invalid action'
        }, 400);
    }

  } catch (error: unknown) {
    console.error('Error in golden-hour-scheduler:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
