-- Fix RLS on views and improve SECURITY DEFINER functions

-- 1. Enable RLS on active_campaigns view
ALTER VIEW active_campaigns SET (security_invoker = true);

-- Note: Views in Supabase inherit RLS from underlying tables when security_invoker is true
-- This makes the view execute with the privileges of the calling user, respecting RLS on campaigns table

-- 2. Enable RLS on campaign_groups view  
ALTER VIEW campaign_groups SET (security_invoker = true);

-- 3. Improve seed_demo_data function with authorization check
CREATE OR REPLACE FUNCTION public.seed_demo_data(demo_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    user_id UUID;
    campaign_id_1 UUID;
    lead_id_1 UUID;
BEGIN
    -- Authorization check: only allow seeding for authenticated user or specified user if authorized
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    user_id := COALESCE(demo_user_id, auth.uid());
    
    -- If trying to seed data for another user, verify authorization (must be same user)
    IF demo_user_id IS NOT NULL AND demo_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized to seed data for other users';
    END IF;

    -- Clear existing demo data for this user
    DELETE FROM public.campaign_metrics WHERE campaign_id IN (
        SELECT id FROM public.campaigns WHERE created_by = user_id
    );
    DELETE FROM public.lead_activities WHERE created_by = user_id;
    DELETE FROM public.content_calendar WHERE created_by = user_id;
    DELETE FROM public.campaigns WHERE created_by = user_id;
    DELETE FROM public.leads WHERE created_by = user_id;

    -- Insert demo campaign
    INSERT INTO public.campaigns (
        id, name, description, type, channel, status, created_by, 
        total_budget, budget_allocated, budget_spent, start_date, end_date,
        primary_objective, target_audience, channels, metrics
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
        '{"reach": 125000, "conversion_rate": 12.5, "impressions": 890000, "clicks": 25400}'::jsonb
    ) RETURNING id INTO campaign_id_1;

    -- Insert demo lead
    INSERT INTO public.leads (
        id, first_name, last_name, email, company, job_title, status,
        lead_score, source, industry, company_size, created_by, tags
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
        '["high-priority", "decision-maker"]'::text[]
    ) RETURNING id INTO lead_id_1;

    -- Insert lead activity
    INSERT INTO public.lead_activities (
        lead_id, activity_type, activity_data, occurred_at, created_by
    ) VALUES 
    (lead_id_1, 'email_opened', '{"campaign": "Product Demo Invitation"}'::jsonb, NOW() - INTERVAL '2 hours', user_id);

    -- Insert campaign metrics
    INSERT INTO public.campaign_metrics (
        campaign_id, metric_type, metric_value, metric_date
    ) VALUES 
    (campaign_id_1, 'impressions', 25400, CURRENT_DATE - 1),
    (campaign_id_1, 'clicks', 1890, CURRENT_DATE - 1),
    (campaign_id_1, 'conversions', 156, CURRENT_DATE - 1);

END;
$function$;

-- 4. Add authentication check to get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    -- Require authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = auth.uid() AND company_id = company_uuid;

    RETURN COALESCE(user_role, 'viewer');
END;
$function$;

-- 5. Add authentication check to user_has_role function
CREATE OR REPLACE FUNCTION public.user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN FALSE
    ELSE EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = check_role)
  END;
$function$;

-- 6. Add authentication check to get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN NULL
    ELSE (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  END;
$function$;