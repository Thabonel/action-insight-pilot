
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { 
  Users, 
  Search, 
  TrendingUp, 
  Target, 
  MessageSquare,
  Download,
  RefreshCw,
  Star,
  Clock,
  ArrowUp
} from 'lucide-react';
import LeadAIAssistant from '@/components/leads/LeadAIAssistant';
import AdaptiveLeadSearch from '@/components/leads/AdaptiveLeadSearch';
import LeadScoringDashboard from '@/components/leads/LeadScoringDashboard';
import ConversionPatternAnalysis from '@/components/leads/ConversionPatternAnalysis';
import SmartLeadLists from '@/components/leads/SmartLeadLists';
import LeadWorkflowAutomation from '@/components/leads/LeadWorkflowAutomation';

const Leads: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const trackingId = behaviorTracker.trackFeatureStart('leads_page');
    return () => {
      behaviorTracker.trackFeatureComplete('leads_page', trackingId);
    };
  }, []);

  const handleSearch = () => {
    behaviorTracker.trackAction('feature_use', 'lead_search', {
      query: searchQuery,
      timestamp: new Date().toISOString()
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    behaviorTracker.trackAction('navigation', 'leads_tab_change', {
      tab,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Generation Intelligence</h1>
          <p className="text-gray-600 mt-2">AI-powered lead scoring and conversion optimization</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Sources
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12% this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold">187</p>
                <p className="text-xs text-blue-600">85%+ score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">23.4%</p>
                <p className="text-xs text-green-600">Above average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Time to Convert</p>
                <p className="text-2xl font-bold">4.2d</p>
                <p className="text-xs text-purple-600">Improving</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <LeadAIAssistant />
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="lists">Smart Lists</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <LeadScoringDashboard />
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <AdaptiveLeadSearch />
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              <ConversionPatternAnalysis />
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <SmartLeadLists />
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <LeadWorkflowAutomation />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Leads;
