
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3,
  Clock,
  Eye,
  Share2,
  Mail,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: number;
  type: string;
  title: string;
  description: string;
  impact: string;
  oneClick: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AIOptimizationCoachProps {
  content: string;
  title: string;
  onContentUpdate: (newContent: string) => void;
}

export const AIOptimizationCoach: React.FC<AIOptimizationCoachProps> = ({
  content,
  title,
  onContentUpdate
}) => {
  const [scores, setScores] = useState({
    readability: 78,
    engagement: 85,
    seo: 72,
    length: 92
  });

  const [predictions, setPredictions] = useState({
    searchRanking: 'Top 10',
    socialShares: 245,
    emailOpenRate: 24.5,
    conversionPotential: 'High'
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 1,
      type: 'improvement',
      title: 'Add more concrete examples',
      description: 'Include 2-3 specific case studies to improve engagement',
      impact: 'High',
      oneClick: true,
      icon: Lightbulb
    },
    {
      id: 2,
      type: 'seo',
      title: 'Optimize title length',
      description: 'Current title is 65 characters. Ideal range is 50-60.',
      impact: 'Medium',
      oneClick: true,
      icon: Target
    },
    {
      id: 3,
      type: 'engagement',
      title: 'Add compelling subheadings',
      description: 'Break content into scannable sections with H2/H3 tags',
      impact: 'High',
      oneClick: false,
      icon: Eye
    },
    {
      id: 4,
      type: 'data',
      title: 'Include relevant statistics',
      description: 'Add industry data to support your main points',
      impact: 'Medium',
      oneClick: false,
      icon: BarChart3
    }
  ]);

  const { toast } = useToast();

  // Real-time content analysis
  useEffect(() => {
    const analyzeContent = () => {
      const wordCount = content.split(' ').length;
      const sentences = content.split('.').length;
      
      // Update scores based on content analysis
      setScores(prev => ({
        ...prev,
        readability: Math.min(100, Math.max(50, 100 - (sentences / wordCount) * 200)),
        length: wordCount > 1500 ? 90 : wordCount > 800 ? 80 : 60
      }));
    };

    if (content) {
      const debounceTimer = setTimeout(analyzeContent, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [content]);

  const applySuggestion = (suggestion: Suggestion) => {
    if (suggestion.oneClick) {
      // Simulate applying the suggestion
      let updatedContent = content;
      
      switch (suggestion.type) {
        case 'improvement':
          updatedContent += '\n\n**Example:** [AI-generated example would be inserted here]';
          break;
        case 'seo':
          // Title optimization would be handled separately
          break;
      }
      
      onContentUpdate(updatedContent);
      
      toast({
        title: "Suggestion Applied",
        description: suggestion.title
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Optimization Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Readability</span>
                <span className={`text-sm font-semibold ${getScoreColor(scores.readability)}`}>
                  {scores.readability}%
                </span>
              </div>
              <Progress value={scores.readability} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Engagement</span>
                <span className={`text-sm font-semibold ${getScoreColor(scores.engagement)}`}>
                  {scores.engagement}%
                </span>
              </div>
              <Progress value={scores.engagement} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">SEO Score</span>
                <span className={`text-sm font-semibold ${getScoreColor(scores.seo)}`}>
                  {scores.seo}%
                </span>
              </div>
              <Progress value={scores.seo} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Content Length</span>
                <span className={`text-sm font-semibold ${getScoreColor(scores.length)}`}>
                  {scores.length}%
                </span>
              </div>
              <Progress value={scores.length} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Performance Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Search Ranking</div>
              <div className="font-semibold text-blue-700">{predictions.searchRanking}</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Share2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Social Shares</div>
              <div className="font-semibold text-green-700">{predictions.socialShares}</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Email Open Rate</div>
              <div className="font-semibold text-purple-700">{predictions.emailOpenRate}%</div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Conversion</div>
              <div className="font-semibold text-orange-700">{predictions.conversionPotential}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">{suggestion.title}</span>
                  </div>
                  <Badge className={getImpactColor(suggestion.impact)}>
                    {suggestion.impact}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {suggestion.oneClick ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {suggestion.oneClick ? 'One-click fix' : 'Manual implementation'}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant={suggestion.oneClick ? 'default' : 'outline'}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion.oneClick ? 'Apply' : 'Guide Me'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Your Content</span>
              <Badge variant="outline">Current</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm">Top Ranking Article #1</span>
              <Badge className="bg-red-100 text-red-800">2,400 words</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="text-sm">Top Ranking Article #2</span>
              <Badge className="bg-yellow-100 text-yellow-800">1,800 words</Badge>
            </div>
            
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Insight:</strong> Top articles average 2,100 words. 
                Consider expanding your content by 600-800 words.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
