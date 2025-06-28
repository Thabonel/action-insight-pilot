-- ===============================================
-- SEED DATA FUNCTION FOR DEVELOPMENT
-- AI Marketing Hub Demo Data
-- ===============================================

CREATE OR REPLACE FUNCTION public.seed_demo_data(demo_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
    campaign_id_1 UUID;
    campaign_id_2 UUID;
    campaign_id_3 UUID;
    lead_id_1 UUID;
    lead_id_2 UUID;
    lead_id_3 UUID;
    lead_id_4 UUID;
BEGIN
    -- Use provided user_id or current auth user
    user_id := COALESCE(demo_user_id, auth.uid());
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user ID provided and no authenticated user found';
    END IF;

    RAISE NOTICE 'Starting to seed demo data for user: %', user_id;

    -- Clear existing demo data for this user
    DELETE FROM public.campaign_metrics WHERE campaign_id IN (
        SELECT id FROM public.campaigns WHERE created_by = user_id
    );
    DELETE FROM public.lead_activities WHERE created_by = user_id;
    DELETE FROM public.campaigns WHERE created_by = user_id;
    DELETE FROM public.leads WHERE created_by = user_id;

    RAISE NOTICE 'Cleared existing data';

    -- Insert demo campaigns
    INSERT INTO public.campaigns (
        id, name, description, type, channel, status, created_by, 
        total_budget, budget_allocated, budget_spent, start_date, end_date,
        primary_objective, target_audience, channels, demographics, kpi_targets,
        content, settings, metrics
    ) VALUES 
    (
        gen_random_uuid(), 
        'Q1 Product Launch Campaign',
        'Comprehensive marketing campaign for our new AI-powered analytics platform',
        'product_launch',
        'multi_channel',
        'active',
        user_id,
        50000.00,
        45000.00,
        12500.00,
        NOW() - INTERVAL '30 days',
        NOW() + INTERVAL '60 days',
        'Increase brand awareness and drive product adoption',
        'Tech-savvy professionals in enterprise companies',
        '["email", "social_media", "content_marketing", "paid_ads"]'::jsonb,
        '{"ageRange": "25-45", "location": "North America", "income": "$75k+", "interests": "Technology, Analytics"}'::jsonb,
        '{"revenue": "500000", "leads": "1000", "conversion": "15", "roi": "300", "impressions": "2000000", "clicks": "50000"}'::jsonb,
        '{"valueProposition": "Revolutionary AI analytics", "keyMessages": ["Easy to use", "Powerful insights", "Enterprise ready"]}'::jsonb,
        '{"smartGoals": "Specific, Measurable, Achievable goals set"}'::jsonb,
        '{"reach": 125000, "conversion_rate": 12.5, "impressions": 890000, "clicks": 25400, "engagement_rate": 8.2}'::jsonb
    ) RETURNING id INTO campaign_id_1;

    INSERT INTO public.campaigns (
        id, name, description, type, channel, status, created_by,
        total_budget, budget_allocated, budget_spent, start_date, end_date,
        primary_objective, target_audience, channels, metrics
    ) VALUES 
    (
        gen_random_uuid(),
        'Summer Email Newsletter Series',
        'Engaging email campaign to nurture leads and drive conversions',
        'email',
        'email',
        'active',
        user_id,
        15000.00,
        15000.00,
        8200.00,
        NOW() - INTERVAL '15 days',
        NOW() + INTERVAL '45 days',
        'Nurture leads and increase customer engagement',
        'Existing subscribers and warm prospects',
        '["email"]'::jsonb,
        '{"reach": 45000, "conversion_rate": 18.3, "impressions": 125000, "clicks": 12800, "engagement_rate": 15.6}'::jsonb
    ) RETURNING id INTO campaign_id_2;

    INSERT INTO public.campaigns (
        id, name, description, type, channel, status, created_by,
        total_budget, budget_allocated, budget_spent, start_date, end_date,
        primary_objective, target_audience, channels, metrics
    ) VALUES 
    (
        gen_random_uuid(),
        'Social Media Brand Awareness',
        'Multi-platform social media campaign to increase brand visibility',
        'social_media',
        'social_media',
        'draft',
        user_id,
        25000.00,
        20000.00,
        0.00,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '90 days',
        'Increase brand awareness and social media following',
        'Young professionals and entrepreneurs',
        '["facebook", "instagram", "linkedin", "twitter"]'::jsonb,
        '{"reach": 0, "conversion_rate": 0, "impressions": 0, "clicks": 0, "engagement_rate": 0}'::jsonb
    ) RETURNING id INTO campaign_id_3;

    RAISE NOTICE 'Inserted % campaigns', 3;

    -- Insert demo leads
    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by,
        enriched_data, tags
    ) VALUES 
    (
        gen_random_uuid(),
        'Sarah',
        'Johnson',
        'sarah.johnson@techcorp.com',
        'TechCorp Solutions',
        'VP of Marketing',
        'qualified',
        85,
        'website',
        'Technology',
        'enterprise',
        user_id,
        '{"linkedin": "sarah-johnson-tech", "company_revenue": "50M+", "employees": "500+"}'::jsonb,
        '["high-priority", "decision-maker"]'::text[]
    ) RETURNING id INTO lead_id_1;

    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by,
        enriched_data, tags
    ) VALUES 
    (
        gen_random_uuid(),
        'Michael',
        'Chen',
        'mchen@startupinc.io',
        'Startup Inc',
        'Founder & CEO',
        'new',
        65,
        'referral',
        'SaaS',
        'startup',
        user_id,
        '{"funding_stage": "Series A", "team_size": "25"}'::jsonb,
        '["startup", "founder"]'::text[]
    ) RETURNING id INTO lead_id_2;

    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by,
        enriched_data, tags
    ) VALUES 
    (
        gen_random_uuid(),
        'Amanda',
        'Rodriguez',
        'a.rodriguez@enterprise.com',
        'Global Enterprise Corp',
        'Director of Digital Strategy',
        'nurturing',
        75,
        'paid_ads',
        'Finance',
        'enterprise',
        user_id,
        '{"budget_authority": "high", "decision_timeline": "Q2"}'::jsonb,
        '["enterprise", "budget-holder"]'::text[]
    ) RETURNING id INTO lead_id_3;

    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by,
        enriched_data, tags
    ) VALUES 
    (
        gen_random_uuid(),
        'David',
        'Wilson',
        'dwilson@midmarket.biz',
        'MidMarket Solutions',
        'Marketing Manager',
        'contacted',
        55,
        'content_marketing',
        'Consulting',
        'mid_market',
        user_id,
        '{"previous_tools": ["HubSpot", "Mailchimp"], "pain_points": ["analytics", "integration"]}'::jsonb,
        '["mid-market", "active"]'::text[]
    ) RETURNING id INTO lead_id_4;

    RAISE NOTICE 'Inserted % leads', 4;

    -- Insert demo lead activities
    INSERT INTO public.lead_activities (
        lead_id, activity_type, activity_data, occurred_at, created_by
    ) VALUES 
    (lead_id_1, 'email_opened', '{"campaign": "Product Demo Invitation", "subject": "See AI Analytics in Action"}'::jsonb, NOW() - INTERVAL '2 hours', user_id),
    (lead_id_1, 'website_visit', '{"page": "/pricing", "duration": 180, "source": "email"}'::jsonb, NOW() - INTERVAL '1 hour', user_id),
    (lead_id_2, 'form_submission', '{"form": "Contact Us", "interest": "Enterprise Plan"}'::jsonb, NOW() - INTERVAL '1 day', user_id),
    (lead_id_3, 'meeting_scheduled', '{"type": "demo", "date": "2024-01-15", "duration": 30}'::jsonb, NOW() - INTERVAL '3 days', user_id),
    (lead_id_4, 'content_download', '{"asset": "ROI Calculator", "type": "whitepaper"}'::jsonb, NOW() - INTERVAL '1 week', user_id);

    RAISE NOTICE 'Inserted % lead activities', 5;

    -- Insert demo campaign metrics for the past 7 days
    INSERT INTO public.campaign_metrics (
        campaign_id, metric_type, metric_value, metric_date, additional_data
    ) VALUES 
    -- Day 1 metrics
    (campaign_id_1, 'impressions', 25400, CURRENT_DATE - 6, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 1890, CURRENT_DATE - 6, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 156, CURRENT_DATE - 6, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 8945, CURRENT_DATE - 6, '{"campaign": "newsletter_week_1"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1245, CURRENT_DATE - 6, '{"campaign": "newsletter_week_1"}'::jsonb),
    
    -- Day 2 metrics
    (campaign_id_1, 'impressions', 28200, CURRENT_DATE - 5, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2100, CURRENT_DATE - 5, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 178, CURRENT_DATE - 5, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 9200, CURRENT_DATE - 5, '{"campaign": "newsletter_week_1"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1380, CURRENT_DATE - 5, '{"campaign": "newsletter_week_1"}'::jsonb),
    
    -- Day 3 metrics
    (campaign_id_1, 'impressions', 31500, CURRENT_DATE - 4, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2350, CURRENT_DATE - 4, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 195, CURRENT_DATE - 4, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 8750, CURRENT_DATE - 4, '{"campaign": "newsletter_week_2"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1190, CURRENT_DATE - 4, '{"campaign": "newsletter_week_2"}'::jsonb),
    
    -- Day 4 metrics
    (campaign_id_1, 'impressions', 29800, CURRENT_DATE - 3, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2180, CURRENT_DATE - 3, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 167, CURRENT_DATE - 3, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 9100, CURRENT_DATE - 3, '{"campaign": "newsletter_week_2"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1290, CURRENT_DATE - 3, '{"campaign": "newsletter_week_2"}'::jsonb),
    
    -- Day 5 metrics
    (campaign_id_1, 'impressions', 33200, CURRENT_DATE - 2, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2420, CURRENT_DATE - 2, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 201, CURRENT_DATE - 2, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 9450, CURRENT_DATE - 2, '{"campaign": "newsletter_week_3"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1350, CURRENT_DATE - 2, '{"campaign": "newsletter_week_3"}'::jsonb),
    
    -- Day 6 metrics
    (campaign_id_1, 'impressions', 27600, CURRENT_DATE - 1, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2050, CURRENT_DATE - 1, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 172, CURRENT_DATE - 1, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 8820, CURRENT_DATE - 1, '{"campaign": "newsletter_week_3"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1180, CURRENT_DATE - 1, '{"campaign": "newsletter_week_3"}'::jsonb),
    
    -- Today's metrics
    (campaign_id_1, 'impressions', 30100, CURRENT_DATE, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'clicks', 2250, CURRENT_DATE, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_1, 'conversions', 186, CURRENT_DATE, '{"platform": "google_ads"}'::jsonb),
    (campaign_id_2, 'email_opens', 9300, CURRENT_DATE, '{"campaign": "newsletter_week_3"}'::jsonb),
    (campaign_id_2, 'email_clicks', 1320, CURRENT_DATE, '{"campaign": "newsletter_week_3"}'::jsonb),
    (campaign_id_2, 'unsubscribes', 23, CURRENT_DATE, '{"campaign": "newsletter_week_3"}'::jsonb);

    RAISE NOTICE 'Inserted campaign metrics for 7 days';

    -- Insert some content calendar entries
    INSERT INTO public.content_calendar (
        title, description, content_type, platform, scheduled_date, status, created_by, content_data
    ) VALUES 
    (
        'Q1 Product Launch Announcement',
        'Social media announcement for our new AI analytics platform',
        'social_post',
        '["linkedin", "twitter"]'::text[],
        NOW() + INTERVAL '2 days',
        'scheduled',
        user_id,
        '{"copy": "Excited to announce our revolutionary AI analytics platform! 🚀", "hashtags": ["#AI", "#Analytics", "#Innovation"]}'::jsonb
    ),
    (
        'Customer Success Story - TechCorp',
        'Blog post featuring TechCorp implementation success',
        'blog_post',
        '["website"]'::text[],
        NOW() + INTERVAL '5 days',
        'draft',
        user_id,
        '{"outline": "Introduction, Challenge, Solution, Results, Conclusion", "target_length": "1500 words"}'::jsonb
    ),
    (
        'Weekly Newsletter - Industry Insights',
        'Weekly roundup of marketing analytics trends',
        'email',
        '["email"]'::text[],
        NOW() + INTERVAL '7 days',
        'draft',
        user_id,
        '{"subject": "This Week in Marketing Analytics", "template": "newsletter_v2"}'::jsonb
    );

    RAISE NOTICE 'Inserted % content calendar entries', 3;

    RAISE NOTICE 'Demo data seeded successfully for user %', user_id;
    RAISE NOTICE 'Created % campaigns, % leads, % activities, and metrics', 3, 4, 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- CONVENIENCE FUNCTIONS FOR DEVELOPMENT
-- ===============================================

-- Function to quickly seed data for current user
CREATE OR REPLACE FUNCTION public.seed_current_user_demo()
RETURNS VOID AS $$
BEGIN
    PERFORM public.seed_demo_data(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all demo data for current user
CREATE OR REPLACE FUNCTION public.clear_user_demo_data(demo_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := COALESCE(demo_user_id, auth.uid());
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user ID provided and no authenticated user found';
    END IF;

    DELETE FROM public.campaign_metrics WHERE campaign_id IN (
        SELECT id FROM public.campaigns WHERE created_by = user_id
    );
    DELETE FROM public.lead_activities WHERE created_by = user_id;
    DELETE FROM public.content_calendar WHERE created_by = user_id;
    DELETE FROM public.campaigns WHERE created_by = user_id;
    DELETE FROM public.leads WHERE created_by = user_id;

    RAISE NOTICE 'Cleared all demo data for user %', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage Examples:
-- For authenticated users: SELECT public.seed_current_user_demo();
-- For specific user: SELECT public.seed_demo_data('user-uuid-here');
-- To clear data: SELECT public.clear_user_demo_data();