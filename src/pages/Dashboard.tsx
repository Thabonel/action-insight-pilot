import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  BarChart3, 
  Calendar,
  DollarSign,
  Target,
  MessageSquare
} from 'lucide-react';
import EnhancedChatInterface from '@/components/dashboard/EnhancedChatInterface';
import { useEmailMetrics } from '@/hooks/useEmailMetrics';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { ChatMessage } from '@/lib/api-client-interface';

const Dashboard: React.FC = () => {
  const { metrics: emailMetrics, loading: emailLoading } = useEmailMetrics();
  const { metrics: realTimeMetrics, loading: realTimeLoading } = useRealTimeMetrics();
  
  // Chat interface state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');

  const handleQuerySubmit = async (query: string) => {
    setIsProcessing(true);
    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: 'user-' + Date.now(),
        role: 'user',
        content: query,
        timestamp: new Date(),
        query: query,
        response: ''
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: `I understand you're asking about: "${query}". Here's what I can help you with...`,
          timestamp: new Date(),
          query: '',
          response: `I understand you're asking about: "${query}". Here's what I can help you with...`
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  // Mock user data
  const user = {
    email: 'user@example.com',
    name: 'Demo User'
  };

  const totalRevenue = 45231.89;
  const activeCampaigns = 12;
  const activeUsers = 2350;

  const revenueChange = 20.1;
  const campaignsChange = 2;
  const usersChange = 180;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your marketing overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Enhanced Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              AI Marketing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedChatInterface
              chatHistory={chatHistory}
              isProcessing={isProcessing}
              query={query}
              setQuery={setQuery}
              handleQuerySubmit={handleQuerySubmit}
              handleSuggestionClick={handleSuggestionClick}
              user={user}
            />
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{revenueChange}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                +{campaignsChange} from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emailLoading ? '...' : emailMetrics?.totalSent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{usersChange} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional dashboard content can be added here */}
      </div>
    </div>
  );
};

export default Dashboard;
