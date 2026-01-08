
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Copy, Check } from 'lucide-react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useToast } from '@/hooks/use-toast';

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
  content: string;
  title: string;
  cta?: string;
  tags?: string[];
  seo_score: number;
  readability_score: number;
  engagement_prediction: number;
}

interface LiveContentSuggestionsProps {
  brief: ContentBrief;
  onSuggestionSelect?: (content: GeneratedContent) => void;
}

const LiveContentSuggestions: React.FC<LiveContentSuggestionsProps> = ({ 
  brief, 
  onSuggestionSelect 
}) => {
  const { loading, content, generateContent } = useContentGeneration();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (brief.title && brief.target_audience) {
      generateContent(brief);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.title, brief.target_audience, brief.content_type]);

  const handleCopyContent = async () => {
    if (content?.content) {
      try {
        await navigator.clipboard.writeText(content.content);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Content copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy content to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    generateContent(brief);
  };

  const handleSelectSuggestion = () => {
    if (content && onSuggestionSelect) {
      onSuggestionSelect(content);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Content Suggestions
          </CardTitle>
          <CardDescription>Generating personalized content...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Content Suggestions
          </CardTitle>
          <CardDescription>
            Fill in the form to get AI-powered content suggestions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Content Suggestions
            </CardTitle>
            <CardDescription>
              Personalized for {brief.target_audience}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested Title */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Suggested Headline:</h4>
          <p className="text-lg font-medium text-slate-900">{content.title}</p>
        </div>

        {/* Content Preview */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Content Preview:</h4>
          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <p className="line-clamp-4">{content.content}</p>
          </div>
        </div>

        {/* Call to Action */}
        {content.cta && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Suggested CTA:</h4>
            <Badge variant="secondary">{content.cta}</Badge>
          </div>
        )}

        {/* Tags/Keywords */}
        {content.tags && content.tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Recommended Tags:</h4>
            <div className="flex flex-wrap gap-1">
              {content.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {content.seo_score}
            </div>
            <div className="text-xs text-gray-600">SEO Score</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {content.readability_score}
            </div>
            <div className="text-xs text-gray-600">Readability</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {Math.round(content.engagement_prediction * 100)}%
            </div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyContent}
            className="flex-1"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Content'}
          </Button>
          {onSuggestionSelect && (
            <Button
              size="sm"
              onClick={handleSelectSuggestion}
              className="flex-1"
            >
              Use This Content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveContentSuggestions;
