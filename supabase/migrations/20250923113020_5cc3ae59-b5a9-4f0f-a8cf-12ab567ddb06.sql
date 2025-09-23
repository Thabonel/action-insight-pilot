-- Enable RLS on active_campaigns table and add security policies
ALTER TABLE public.active_campaigns ENABLE ROW LEVEL SECURITY;

-- Users can only view campaigns they created
CREATE POLICY "Users can view their own active campaigns" 
ON public.active_campaigns 
FOR SELECT 
USING (auth.uid() = created_by);

-- Users can only insert campaigns they create
CREATE POLICY "Users can create their own active campaigns" 
ON public.active_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Users can only update campaigns they created
CREATE POLICY "Users can update their own active campaigns" 
ON public.active_campaigns 
FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can only delete campaigns they created
CREATE POLICY "Users can delete their own active campaigns" 
ON public.active_campaigns 
FOR DELETE 
USING (auth.uid() = created_by);

-- Service role needs full access for system operations
CREATE POLICY "Service role full access to active campaigns" 
ON public.active_campaigns 
FOR ALL 
USING (auth.role() = 'service_role');

-- Enable RLS on campaign_groups table
ALTER TABLE public.campaign_groups ENABLE ROW LEVEL SECURITY;

-- Since campaign_groups doesn't have a created_by column, we need to join with campaigns table
-- Users can only view campaign groups that contain their campaigns
CREATE POLICY "Users can view campaign groups containing their campaigns" 
ON public.campaign_groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.campaign_group_id = campaign_groups.campaign_group_id 
    AND c.created_by = auth.uid()
  )
);

-- Users can insert campaign groups (this will be controlled by application logic)
CREATE POLICY "Authenticated users can create campaign groups" 
ON public.campaign_groups 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Users can update campaign groups containing their campaigns
CREATE POLICY "Users can update campaign groups containing their campaigns" 
ON public.campaign_groups 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.campaign_group_id = campaign_groups.campaign_group_id 
    AND c.created_by = auth.uid()
  )
);

-- Users can delete campaign groups containing their campaigns
CREATE POLICY "Users can delete campaign groups containing their campaigns" 
ON public.campaign_groups 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.campaign_group_id = campaign_groups.campaign_group_id 
    AND c.created_by = auth.uid()
  )
);

-- Service role needs full access for system operations
CREATE POLICY "Service role full access to campaign groups" 
ON public.campaign_groups 
FOR ALL 
USING (auth.role() = 'service_role');