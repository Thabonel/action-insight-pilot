
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, ContentBrief } from '@/lib/api-client-interface';

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  html_content: string;
  cta: string;
  seo_score: number;
  readability_score: number;
  engagement_prediction: number;
  tags: string[];
  status: string;
}

export function useContentGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const generateContent = async (brief: Partial<ContentBrief>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a proper ContentBrief with required properties
      const fullBrief: ContentBrief = {
        topic: brief.title || brief.topic || '',
        audience: brief.target_audience || brief.audience || '',
        tone: brief.tone || 'professional',
        platform: brief.platform || 'website',
        length: brief.length || 'medium',
        keywords: brief.keywords,
        title: brief.title,
        target_audience: brief.target_audience,
        content_type: brief.content_type,
        key_messages: brief.key_messages
      };

      const response = await apiClient.generateContent(fullBrief) as ApiResponse<any>;

      if (response.success && response.data) {
        const responseData = response.data as any;
        
        const generatedContent: GeneratedContent = {
          id: responseData.id || '',
          title: responseData.title || '',
          content: responseData.content || '',
          html_content: responseData.html_content || '',
          cta: responseData.cta || '',
          seo_score: responseData.seo_score || 0,
          readability_score: responseData.readability_score || 0,
          engagement_prediction: responseData.engagement_prediction || 0,
          tags: responseData.tags || [],
          status: responseData.status || 'generated'
        };
        
        setContent(generatedContent);
        toast({
          title: "Content Generated",
          description: "AI-powered content has been successfully generated!",
        });
        return generatedContent;
      } else {
        const errorMessage = response.error || 'Failed to generate content';
        setError(errorMessage);
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setContent(null);
  };

  return {
    loading,
    error,
    content,
    generateContent,
    reset
  };
}

