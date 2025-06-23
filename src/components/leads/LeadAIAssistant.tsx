
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface LeadSuggestion {
  id: string;
  type: 'follow_up' | 'qualification' | 'nurture' | 'conversion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  reasoning: string;
  actions: string[];
}

interface AIInsight {
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  data?: any;
}

const LeadAIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<LeadSuggestion[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [leadScores, setLeadScores] = useState<any[]>([]);
  const { toast } = useToast();

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const response = await apiClient.executeAgentTask('lead_analysis', { query });
      
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions || []);
        setInsights(response.data.insights || []);
        
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your leads and generated recommendations.",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScoreLeads = async () => {
    setIsProcessing(true);
    try {
      const response = await apiClient.scoreLeads({ includeInsights: true });
      
      if (response.success && response.data) {
        setLeadScores(response.data);
        
        toast({
          title: "Scoring Complete",
          description: "All leads have been scored and prioritized.",
        });
      }
    } catch (error) {
      toast({
        title: "Scoring Failed",
        description: "Failed to score leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTask = async (taskType: string, leadId?: string) => {
    setIsProcessing(true);
    try {
      const response = await apiClient.executeAgentTask(taskType, { leadId });
      
      if (response.success) {
        toast({
          title: "Task Executed",
          description: `Successfully executed ${taskType} task.`,
        });
      }
    } catch (error) {
      toast({
        title: "Task Failed",
        description: `Failed to execute ${taskType} task.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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

  const getImpactIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'risk': return <AlertCircle className="h-4 w-4" />;
      case 'recommendation': return <CheckCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Lead AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ask about your leads
                  </label>
                  <Textarea
                    placeholder="e.g., 'Which leads should I focus on this week?' or 'Show me leads likely to convert'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleQuery}
                    disabled={isProcessing || !query.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Analyze Leads
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleScoreLeads}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No suggestions yet. Ask the AI assistant to analyze your leads!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(suggestion.confidence * 100)}% confident
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {suggestion.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleExecuteTask(action, suggestion.id)}
                              disabled={isProcessing}
                            >
                              {action.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No insights available. Generate lead analysis to see AI insights!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {insights.map((insight, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {getImpactIcon(insight.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {insight.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {insight.timeframe}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scoring" className="space-y-4">
              {leadScores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No lead scores available. Click "Score Leads" to generate AI-powered lead scores!</p>
                  <Button 
                    className="mt-4"
                    onClick={handleScoreLeads}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scoring...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Score All Leads
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {leadScores.map((lead) => (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {lead.name || lead.email}
                            </h4>
                            <p className="text-sm text-gray-600">{lead.company}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {lead.score || 0}
                            </div>
                            <p className="text-xs text-gray-500">Lead Score</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadAIAssistant;
