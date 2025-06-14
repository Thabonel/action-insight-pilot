
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/integrations/supabase/client';

type ServerStatus = 'sleeping' | 'waking' | 'awake' | 'error';

interface ChatMessage {
  id: string;
  query: string;
  response: any;
  timestamp: Date;
}

export const useConversationalDashboard = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState(behaviorTracker.getInsights());
  const [conversationContext, setConversationContext] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('awake');
  const [serverError, setServerError] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'conversational_dashboard', { section: 'main' });
    
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const wakeUpServer = async () => {
    setServerStatus('waking');
    setServerError('');
    
    try {
      const result = await apiClient.httpClient.wakeUpServer();
      if (result.success) {
        setServerStatus('awake');
        toast({
          title: "Server Ready",
          description: "AI assistant is now active and ready to use.",
        });
      } else {
        setServerStatus('error');
        setServerError(result.error || 'Failed to wake up server');
        toast({
          title: "Wake Up Failed",
          description: result.error || "Failed to wake up the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      setServerStatus('error');
      setServerError('Unexpected error during server wake-up');
      toast({
        title: "Wake Up Error",
        description: "An unexpected error occurred while waking up the server",
        variant: "destructive",
      });
    }
  };

  const determineQueryType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('focus') && (lowerQuery.includes('today') || lowerQuery.includes('should'))) {
      return 'daily_focus';
    }
    
    return 'general';
  };

  const callDailyFocusAgent = async (query: string, campaigns: any[], context: any[], authToken: string) => {
    const requestData = {
      query,
      campaigns,
      context,
      date: new Date().toISOString().split('T')[0]
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/daily-focus', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        setServerStatus('sleeping');
        throw new Error('Backend server is sleeping. Please wake it up first.');
      }
      throw new Error(`Daily focus agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Daily focus agent failed: ${data.error}`);
    }
    
    return data.data;
  };

  const callGeneralCampaignAgent = async (query: string, campaigns: any[], context: any[], authToken: string) => {
    const requestData = {
      task_type: 'general_query',
      input_data: {
        query,
        campaigns,
        context
      }
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/campaign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        setServerStatus('sleeping');
        throw new Error('Backend server is sleeping. Please wake it up first.');
      }
      throw new Error(`Campaign agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Campaign agent failed: ${data.error}`);
    }
    
    return data.data;
  };

  const formatAgentResponse = (agentResponse: any, queryType: string, campaignData: any[]) => {
    if (!agentResponse) {
      throw new Error('AI agent returned no data');
    }
    
    if (queryType === 'daily_focus') {
      return {
        type: 'daily_focus',
        title: agentResponse.title || 'Your Marketing Focus for Today',
        explanation: agentResponse.focus_summary || agentResponse.explanation || 'Based on your current campaigns and performance data, here\'s what deserves your attention today.',
        businessImpact: agentResponse.business_impact || 'Focusing on these priorities could improve your marketing ROI significantly.',
        nextActions: agentResponse.recommended_actions || [
          'Review underperforming campaigns',
          'Optimize high-potential content',
          'Follow up on hot leads'
        ],
        data: agentResponse.priority_items || []
      };
    }
    
    const lowerQuery = agentResponse.query?.toLowerCase() || '';
    let title = 'AI Marketing Insights';
    let explanation = agentResponse.explanation || agentResponse.focus_summary || 'Here are insights based on your marketing data.';
    
    if (lowerQuery.includes('campaign') && lowerQuery.includes('running')) {
      title = `Campaign Status Overview`;
      explanation = `You currently have ${campaignData.length} campaigns in your system. ${agentResponse.explanation || 'All campaigns appear to be configured and ready for optimization.'}`;
    } else if (lowerQuery.includes('best') && lowerQuery.includes('performing')) {
      title = 'Top Performing Campaigns';
      explanation = agentResponse.explanation || `Based on your campaign data, here are the performance insights for your ${campaignData.length} campaigns.`;
    }
    
    return {
      type: 'general',
      title,
      explanation,
      businessImpact: agentResponse.business_impact || 'These insights can help improve your marketing effectiveness.',
      nextActions: agentResponse.recommended_actions || agentResponse.next_actions || ['Review the analysis', 'Take action on priority items']
    };
  };

  const processQueryWithRealAI = async (userQuery: string, context: any[]) => {
    try {
      console.log('Fetching campaign data...');
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication token not available');
      }

      const directResponse = await fetch('https://wheels-wins-orchestrator.onrender.com/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!directResponse.ok) {
        if (directResponse.status === 0 || directResponse.status >= 500) {
          setServerStatus('sleeping');
          throw new Error('Backend server is sleeping. Please wake it up first.');
        }
        throw new Error(`Campaign fetch failed: ${directResponse.status} ${directResponse.statusText}`);
      }
      
      const campaignsResponse = await directResponse.json();
      
      if (!campaignsResponse.success) {
        throw new Error('Failed to fetch campaign data');
      }
      
      const campaignData = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
      const queryType = determineQueryType(userQuery);
      
      let agentResponse;
      
      if (queryType === 'daily_focus') {
        agentResponse = await callDailyFocusAgent(userQuery, campaignData, context, authToken);
      } else {
        agentResponse = await callGeneralCampaignAgent(userQuery, campaignData, context, authToken);
      }
      
      return formatAgentResponse(agentResponse, queryType, campaignData);
      
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('conversational_query');
    setIsProcessing(true);

    try {
      if (serverStatus === 'sleeping') {
        console.log('Server is sleeping, waking it up first...');
        setServerStatus('waking');
        
        toast({
          title: "Preparing AI Assistant",
          description: "Waking up the backend server, this may take up to 60 seconds...",
        });

        const wakeUpResult = await apiClient.httpClient.wakeUpServer();
        if (!wakeUpResult.success) {
          setServerStatus('error');
          setServerError(wakeUpResult.error || 'Failed to wake up server');
          throw new Error(wakeUpResult.error || 'Failed to wake up server');
        }
        
        setServerStatus('awake');
        toast({
          title: "AI Assistant Ready",
          description: "Now processing your request...",
        });
      }

      const response = await processQueryWithRealAI(query, conversationContext);
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, newChat]);
      
      setConversationContext(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: response }
      ].slice(-10));
      
      setQuery('');
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, true);
      
      toast({
        title: "AI Response Generated",
        description: "Your marketing assistant has analyzed your request.",
      });
    } catch (error) {
      console.error('Query processing failed:', error);
      setServerStatus('error');
      setServerError(error instanceof Error ? error.message : 'Unknown error');
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, false);
      
      const errorResponse = {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.',
        businessImpact: 'Your marketing data is safe and campaigns are still running.',
        nextActions: ['Try rephrasing your question', 'Check back in a few minutes', 'Contact support if issue persists']
      };
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, newChat]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return {
    query,
    setQuery,
    chatHistory,
    isProcessing,
    insights,
    serverStatus,
    serverError,
    user,
    handleQuerySubmit,
    handleSuggestionClick,
    wakeUpServer
  };
};
