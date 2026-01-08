import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Target,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Recommendation {
  type: 'mention' | 'hashtag' | 'timing' | 'content' | 'engagement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
  impact: string
  confidence: number
}

interface EngagementRecommendationsPanelProps {
  postContent?: string
  platform?: string
  selectedPlatforms?: string[]
}

export const EngagementRecommendationsPanel: React.FC<EngagementRecommendationsPanelProps> = ({
  postContent = '',
  platform = 'twitter',
  selectedPlatforms = []
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  const generateRecommendations = async () => {
    if (!user || !postContent || postContent.length < 10) {
      setRecommendations([]);
      return;
    }

    try {
      setIsLoading(true);

      const recs: Recommendation[] = [];

      // 1. Smart Mention Suggestions
      try {
        const { data: mentionData } = await supabase.functions.invoke('smart-mention-suggester', {
          body: {
            postContent,
            platform: selectedPlatforms[0] || platform,
            context: {}
          }
        });

        if (mentionData?.suggestions && mentionData.suggestions.length > 0) {
          const topMention = mentionData.suggestions[0];
          recs.push({
            type: 'mention',
            priority: topMention.confidence > 0.7 ? 'high' : 'medium',
            title: `Tag @${topMention.handle}`,
            description: topMention.reason,
            action: `Add @${topMention.handle} to your post`,
            impact: `+${Math.round(topMention.confidence * 30)}% engagement`,
            confidence: topMention.confidence
          });
        }
      } catch (error) {
        console.error('Error fetching mention suggestions:', error);
      }

      // 2. Hashtag Performance Predictions
      const extractedHashtags = postContent.match(/#\w+/g);
      if (extractedHashtags && extractedHashtags.length > 0) {
        try {
          const { data: hashtagData } = await supabase.functions.invoke('hashtag-performance-predictor', {
            body: {
              hashtags: extractedHashtags,
              platform: selectedPlatforms[0] || platform,
              postContent
            }
          });

          if (hashtagData?.predictions) {
            const poorPerformers = hashtagData.predictions.filter((p: Record<string, unknown>) =>
              p.recommendation === 'poor'
            );

            if (poorPerformers.length > 0) {
              recs.push({
                type: 'hashtag',
                priority: 'medium',
                title: 'Improve Hashtag Performance',
                description: `${poorPerformers.length} hashtag(s) predicted to underperform`,
                action: `Replace ${poorPerformers[0].hashtag} with higher-performing alternatives`,
                impact: `+${Math.round((3 - poorPerformers[0].predicted_engagement) * 10)}% engagement`,
                confidence: poorPerformers[0].confidence
              });
            }

            const excellentPerformers = hashtagData.predictions.filter((p: Record<string, unknown>) =>
              p.recommendation === 'excellent'
            );

            if (excellentPerformers.length > 0) {
              recs.push({
                type: 'hashtag',
                priority: 'low',
                title: 'Great Hashtag Choices!',
                description: `${excellentPerformers.length} hashtag(s) predicted to perform excellently`,
                impact: `${excellentPerformers[0].predicted_engagement.toFixed(1)}% predicted engagement`,
                confidence: excellentPerformers[0].confidence
              });
            }
          }
        } catch (error) {
          console.error('Error fetching hashtag predictions:', error);
        }
      } else {
        // Suggest adding hashtags
        recs.push({
          type: 'hashtag',
          priority: 'high',
          title: 'Add Hashtags for Discovery',
          description: 'No hashtags detected in your post',
          action: 'Add 3-5 relevant hashtags to increase reach',
          impact: '+40% average reach improvement',
          confidence: 0.85
        });
      }

      // 3. Content Length Recommendation
      const wordCount = postContent.trim().split(/\s+/).length;
      if (platform === 'twitter' && wordCount < 10) {
        recs.push({
          type: 'content',
          priority: 'medium',
          title: 'Expand Your Message',
          description: 'Short posts may lack context',
          action: 'Add more details or explanation to increase engagement',
          impact: '+25% engagement for posts with 15-20 words',
          confidence: 0.7
        });
      }

      // 4. Optimal Timing (if historical data available)
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        recs.push({
          type: 'timing',
          priority: 'medium',
          title: 'Consider Scheduling for Peak Hours',
          description: 'Posting now may limit visibility',
          action: 'Schedule for 9 AM - 3 PM for better engagement',
          impact: '+35% average engagement during peak hours',
          confidence: 0.75
        });
      }

      // 5. Call-to-Action Recommendation
      const hasQuestion = postContent.includes('?');
      const hasCTA = /\b(click|visit|check out|learn more|join|sign up|download)\b/i.test(postContent);

      if (!hasQuestion && !hasCTA) {
        recs.push({
          type: 'engagement',
          priority: 'medium',
          title: 'Add Call-to-Action',
          description: 'Posts with questions or CTAs get more engagement',
          action: 'End with a question or clear next step',
          impact: '+20% comment rate with questions',
          confidence: 0.8
        });
      }

      // Sort by priority (high -> medium -> low)
      recs.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setRecommendations(recs.slice(0, 5)); // Top 5 recommendations
    } catch (error: unknown) {
      console.error('Error generating recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations';
      toast({
        title: 'Failed to generate recommendations',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postContent && postContent.length >= 10) {
      const timer = setTimeout(() => {
        generateRecommendations();
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    } else {
      setRecommendations([]);
    }
  }, [postContent, platform, selectedPlatforms]);

  const markAsApplied = (index: number) => {
    setAppliedRecommendations(prev => new Set(prev).add(index.toString()));
    toast({
      title: 'Recommendation applied',
      description: 'Great! This should improve your post engagement.'
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <Users className="h-4 w-4" />;
      case 'hashtag':
        return <Target className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'content':
        return <Sparkles className="h-4 w-4" />;
      case 'engagement':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  if (!postContent || postContent.length < 10) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Recommendations
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 && !isLoading && (
          <div className="text-center p-6 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              Type more content to get AI-powered engagement recommendations
            </p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  appliedRecommendations.has(index.toString())
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(rec.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(rec.priority)}
                      >
                        {getPriorityIcon(rec.priority)}
                        <span className="ml-1 capitalize">{rec.priority}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>

                    {rec.action && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        <p className="text-sm text-blue-900">
                          <strong>Action:</strong> {rec.action}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {rec.impact}
                      </Badge>

                      {!appliedRecommendations.has(index.toString()) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsApplied(index)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Applied
                        </Button>
                      )}

                      {appliedRecommendations.has(index.toString()) && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
