
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface SystemMetrics {
  activeCampaigns: number;
  totalLeads: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  lastUpdated: Date;
}

const SystemOverviewCards: React.FC = () => {
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeCampaigns: 0,
    totalLeads: 0,
    systemStatus: 'healthy',
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = async () => {
    try {
      setIsLoading(true);
      
      const [leads, systemHealth] = await Promise.all([
        apiClient.getLeads().catch(() => []),
        apiClient.getSystemHealth().catch(() => ({ status: 'unknown' }))
      ]);

      const activeCampaigns = campaigns?.filter(c => 
        c.created_at && new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setSystemMetrics({
        activeCampaigns,
        totalLeads: leads.length,
        systemStatus: systemHealth.status === 'healthy' ? 'healthy' : 
                     systemHealth.status === 'degraded' ? 'warning' : 'error',
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
      setSystemMetrics({
        activeCampaigns: campaigns?.length || 0,
        totalLeads: 0,
        systemStatus: 'error',
        lastUpdated: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading || campaignsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemMetrics.activeCampaigns}</div>
          <p className="text-xs text-muted-foreground">
            {systemMetrics.activeCampaigns > 0 ? 'Running campaigns' : 'No active campaigns'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemMetrics.totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            {systemMetrics.totalLeads > 0 ? 'Leads in pipeline' : 'No leads yet'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          {getStatusIcon(systemMetrics.systemStatus)}
        </CardHeader>
        <CardContent>
          <Badge className={getStatusColor(systemMetrics.systemStatus)}>
            {systemMetrics.systemStatus.charAt(0).toUpperCase() + systemMetrics.systemStatus.slice(1)}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Last checked {systemMetrics.lastUpdated.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Ready</div>
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Available for queries
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverviewCards;
