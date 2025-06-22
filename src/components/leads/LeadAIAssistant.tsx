
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Sparkles, Target, TrendingUp, Users, Loader2 } from 'lucide-react';

interface AIInsight {
  type: 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

interface LeadScore {
  leadId: string;
  score: number;
  factors: string[];
  recommendation: string;
}

const LeadAIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringCriteria, setScoringCriteria] = useState('');
  const { toast } = useToast();

  const analyzeLeads = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a question or request for lead analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.executeAgentTask('lead_analysis', JSON.stringify({}));
      if (response.success && response.data) {
        setInsights(response.data.insights || []);
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your lead data and generated insights!",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreLeads = async () => {
    setIsScoring(true);
    try {
      const response = await apiClient.scoreLeads(JSON.stringify({}));
      if (response.success && response.data) {
        setLeadScores(response.data.scores || []);
        toast({
          title: "Scoring Complete",
          description: "AI has scored your leads based on conversion probability!",
        });
      }
    } catch (error) {
      toast({
        title: "Scoring Failed",
        description: "Failed to score leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScoring(false);
    }
  };

  const generateRecommendations = async () => {
    if (!scoringCriteria.trim()) {
      toast({
        title: "Criteria Required",
        description: "Please specify criteria for lead recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.executeAgentTask('lead_recommendations', JSON.stringify({ 
        criteria: scoringCriteria 
      }));
      if (response.success && response.data) {
        setInsights(response.data.recommendations || []);
        toast({
          title: "Recommendations Ready",
          description: "AI has generated personalized lead recommendations!",
        });
      }
    } catch (error) {
      toast({
        title: "Recommendations Failed",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Lead AI Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered insights, scoring, and recommendations for your leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ask AI about your leads</label>
              <Textarea
                placeholder="e.g., 'Which leads are most likely to convert this month?' or 'What patterns do you see in my high-value leads?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={analyzeLeads}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Analyze Leads
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={scoreLeads}
              disabled={isScoring}
              variant="outline"
              className="flex-1"
            >
              {isScoring ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              Score All Leads
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recommendation Criteria</label>
              <Textarea
                placeholder="e.g., 'Focus on enterprise customers in technology sector' or 'Prioritize leads with recent website activity'"
                value={scoringCriteria}
                onChange={(e) => setScoringCriteria(e.target.value)}
                rows={2}
              />
            </div>
            <Button
              onClick={generateRecommendations}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Generate Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Scores */}
      {leadScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Scores</CardTitle>
            <CardDescription>
              AI-calculated conversion probability scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leadScores.map((leadScore, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Lead #{leadScore.leadId}</span>
                    <span className={`text-2xl font-bold ${getScoreColor(leadScore.score)}`}>
                      {leadScore.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{leadScore.recommendation}</p>
                  <div className="flex flex-wrap gap-1">
                    {leadScore.factors.map((factor, factorIndex) => (
                      <Badge key={factorIndex} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadAIAssistant;
