
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface ContentBrief {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
}

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

  const generateContent = async (brief: ContentBrief) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.httpClient.request('/api/content/generate', {
        method: 'POST',
        body: JSON.stringify(brief),
      });

      if (response.success && response.data) {
        setContent(response.data);
        toast({
          title: "Content Generated",
          description: "AI-powered content has been successfully generated!",
        });
        return response.data;
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
