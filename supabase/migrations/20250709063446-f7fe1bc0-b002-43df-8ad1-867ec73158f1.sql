-- Create performance monitoring table for real-time optimization
CREATE TABLE public.campaign_performance_monitor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id),
  channel TEXT NOT NULL,
  metrics JSONB NOT NULL,
  benchmark_metrics JSONB,
  performance_score REAL DEFAULT 0,
  optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  auto_actions_taken JSONB DEFAULT '[]'::jsonb,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create predictive analytics table
CREATE TABLE public.campaign_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id),
  prediction_type TEXT NOT NULL, -- 'kpi_forecast', 'budget_optimization', 'performance_prediction'
  prediction_data JSONB NOT NULL,
  confidence_score REAL NOT NULL,
  based_on_campaigns JSONB, -- historical campaign IDs used for prediction
  actual_outcome JSONB, -- filled after campaign completes
  accuracy_score REAL, -- calculated after campaign completes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create full content generation table
CREATE TABLE public.generated_content_pieces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id),
  content_type TEXT NOT NULL, -- 'blog_post', 'ad_copy', 'email', 'social_post'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
  performance_data JSONB,
  created_by_agent TEXT DEFAULT 'ai_content_generator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_performance_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content_pieces ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view performance for their campaigns" ON public.campaign_performance_monitor
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_performance_monitor.campaign_id 
    AND campaigns.created_by = auth.uid()
  ));

CREATE POLICY "Users can view predictions for their campaigns" ON public.campaign_predictions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_predictions.campaign_id 
    AND campaigns.created_by = auth.uid()
  ));

CREATE POLICY "Users can manage content for their campaigns" ON public.generated_content_pieces
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = generated_content_pieces.campaign_id 
    AND campaigns.created_by = auth.uid()
  ));

-- Service role full access
CREATE POLICY "Service role full access performance" ON public.campaign_performance_monitor
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access predictions" ON public.campaign_predictions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access content" ON public.generated_content_pieces
  FOR ALL USING (auth.role() = 'service_role');