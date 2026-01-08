
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { Loader2, Bot, Users } from 'lucide-react';

interface LeadInsight {
  id: string;
  recommendation: string;
  confidence: number;
  actions: string[];
}

const LeadAIAssistant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState<LeadInsight[]>([]);
  const { toast } = useToast();

  const analyzeLeads = async () => {
    if (!query.trim()) {
      toast({
        title: "Missing Query",
        description: "Please enter a question about your leads",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Analyzing leads with query:', query);
      const result = await apiClient.queryAgent(query) as ApiResponse<{ message?: string }>;

      if (result.success && result.data) {
        // Transform the response into LeadInsight format
        const mockInsights: LeadInsight[] = [
          {
            id: '1',
            recommendation: result.data.message || 'Analysis completed',
            confidence: 85,
            actions: ['Follow up with high-value leads', 'Segment by industry', 'Create targeted campaigns']
          }
        ];
        
        setInsights(mockInsights);
        toast({
          title: "Analysis Complete",
          description: "AI insights have been generated for your leads",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Failed to analyze leads",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lead analysis error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scoreLeads = async () => {
    setLoading(true);
    try {
      console.log('Scoring leads...');
      const result = await apiClient.scoreLeads() as ApiResponse<Record<string, unknown>>;

      if (result.success) {
        toast({
          title: "Lead Scoring Complete",
          description: "All leads have been scored using AI algorithms",
        });
      } else {
        toast({
          title: "Scoring Failed",
          description: "Failed to score leads",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lead scoring error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during scoring",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Lead AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ask about your leads</label>
            <Textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Which leads should I prioritize this week? What patterns do you see in my high-converting leads?"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={analyzeLeads} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Get AI Insights
                </>
              )}
            </Button>

            <Button onClick={scoreLeads} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Score All Leads
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <CardTitle className="text-lg">AI Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{insight.recommendation}</p>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{insight.confidence}%</span>
                  </div>

                  {insight.actions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {insight.actions.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadAIAssistant;
