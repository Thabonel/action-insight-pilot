-- Create keyword_research table for storing keyword research data
CREATE TABLE public.keyword_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_keyword_research_created_by ON public.keyword_research(created_by);
CREATE INDEX idx_keyword_research_created_at ON public.keyword_research(created_at);
CREATE INDEX idx_keyword_research_query ON public.keyword_research(query);

-- Enable RLS
ALTER TABLE public.keyword_research ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own keyword research" 
ON public.keyword_research 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own keyword research" 
ON public.keyword_research 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own keyword research" 
ON public.keyword_research 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own keyword research" 
ON public.keyword_research 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_keyword_research_updated_at
    BEFORE UPDATE ON public.keyword_research
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();