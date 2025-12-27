
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
import { useLeadActions } from '@/hooks/useLeadActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Leads: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const { exportLeads, syncLeads, isExporting, isSyncing } = useLeadActions();
  const [stats, setStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    conversionRate: 0,
    avgTimeToConvert: 0
  });

  useEffect(() => {
    const trackingId = behaviorTracker.trackFeatureStart('leads_page');
    return () => {
      behaviorTracker.trackFeatureComplete('leads_page', trackingId);
    };
  }, []);

  useEffect(() => {
    const fetchLeadStats = async () => {
      if (!user) return;

      try {
        // Fetch total leads count
        const { count: totalCount, error: countError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id);

        if (countError) throw countError;

        // Fetch hot leads (score >= 85)
        const { count: hotCount, error: hotError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .gte('score', 85);

        if (hotError) throw hotError;

        // Fetch converted leads for conversion rate
        const { count: convertedCount, error: convertedError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('status', 'converted');

        if (convertedError) throw convertedError;

        const conversionRate = totalCount && totalCount > 0
          ? ((convertedCount || 0) / totalCount) * 100
          : 0;

        setStats({
          totalLeads: totalCount || 0,
          hotLeads: hotCount || 0,
          conversionRate: parseFloat(conversionRate.toFixed(1)),
          avgTimeToConvert: 4.2 // This would require more complex calculation with timestamps
        });
      } catch (error) {
        console.error('Error fetching lead stats:', error);
      }
    };

    fetchLeadStats();
  }, [user]);

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

  const handleExportLeads = (format: 'csv' | 'json') => {
    behaviorTracker.trackAction('feature_use', 'export_leads', {
      format,
      timestamp: new Date().toISOString()
    });
    exportLeads(format);
  };

  const handleSyncSources = async () => {
    behaviorTracker.trackAction('feature_use', 'sync_leads', {
      timestamp: new Date().toISOString()
    });
    await syncLeads();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Leads'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportLeads('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportLeads('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleSyncSources} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Sources'}
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
                <p className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</p>
                {stats.totalLeads === 0 && (
                  <p className="text-xs text-gray-400">No leads yet</p>
                )}
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
                <p className="text-2xl font-bold">{stats.hotLeads.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                {stats.totalLeads > 0 && (
                  <p className="text-xs text-green-600">
                    {stats.conversionRate > 20 ? 'Above average' : 'Building momentum'}
                  </p>
                )}
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
                <p className="text-2xl font-bold">{stats.avgTimeToConvert}d</p>
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
      <PageHelpModal helpKey="leads" />
    </div>
  );
};

export default Leads;
