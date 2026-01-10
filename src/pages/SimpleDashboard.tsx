import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LeadInbox from '@/components/autopilot/LeadInbox';
import ActivityFeed from '@/components/autopilot/ActivityFeed';
import { Link } from 'react-router-dom';
import { PageHelpModal } from '@/components/common/PageHelpModal';

interface DashboardStats {
  this_week_leads: number;
  this_week_spend: number;
  this_week_roi: number;
  total_leads: number;
  week_start: string;
}

interface AutopilotConfig {
  is_active: boolean;
  monthly_budget: number;
  business_description: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  total_budget: number;
  budget_spent: number;
  created_at: string;
}

const SimpleDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    this_week_leads: 0,
    this_week_spend: 0,
    this_week_roi: 0,
    total_leads: 0,
    week_start: new Date().toISOString()
  });
  const [autopilotConfig, setAutopilotConfig] = useState<AutopilotConfig | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch autopilot config
      const { data: configData, error: configError } = await supabase
        .from('marketing_autopilot_config')
        .select('is_active, monthly_budget, business_description')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (configError) {
        console.error('Error fetching autopilot config:', configError);
      }

      setAutopilotConfig(configData);

      // Fetch dashboard stats using the database function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_autopilot_dashboard_stats', { p_user_id: user?.id });

      if (statsError) throw statsError;

      setStats(statsData || stats);

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status, type, total_budget, budget_spent, created_at')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
      } else {
        setCampaigns(campaignsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutopilot = async () => {
    if (!autopilotConfig) return;

    try {
      const newStatus = !autopilotConfig.is_active;

      const { error } = await supabase
        .from('marketing_autopilot_config')
        .update({ is_active: newStatus })
        .eq('user_id', user?.id);

      if (error) throw error;

      setAutopilotConfig({ ...autopilotConfig, is_active: newStatus });

      toast({
        title: newStatus ? 'Autopilot Activated' : 'Autopilot Paused',
        description: newStatus
          ? 'Your marketing campaigns are now running automatically'
          : 'All automated marketing has been paused',
      });
    } catch (error: unknown) {
      console.error('Error toggling autopilot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update autopilot';
      toast({
        title: 'Failed to update autopilot',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!autopilotConfig) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Marketing Autopilot</h2>
            <p className="text-gray-600 mb-6">
              Let AI handle your marketing automatically while you focus on your business
            </p>
            <Link to="/app/autopilot/setup">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Autopilot</h1>
          <p className="text-gray-600 mt-1">Your AI is running your marketing 24/7</p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/settings">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
          <Button
            variant={autopilotConfig.is_active ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleAutopilot}
          >
            {autopilotConfig.is_active ? 'Pause Autopilot' : 'Resume Autopilot'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {!autopilotConfig.is_active && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-yellow-900">Autopilot is paused</p>
                <p className="text-sm text-yellow-700">
                  Your campaigns are not running. Click "Resume Autopilot" to continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Week Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">This Week</h2>
            <Badge variant="secondary">
              {new Date(stats.week_start).toLocaleDateString()} - Today
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leads */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-100 text-blue-700">New</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.this_week_leads.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Leads Generated</p>
            </div>

            {/* Spend */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">
                  {autopilotConfig.monthly_budget
                    ? `$${autopilotConfig.monthly_budget.toLocaleString()} budget`
                    : 'Budget set'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.this_week_spend.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Spend</p>
            </div>

            {/* ROI */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-green-100 text-green-700">Strong</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.this_week_roi}x
              </p>
              <p className="text-sm text-gray-600 mt-1">Return on Investment</p>
            </div>
          </div>

          {stats.this_week_leads === 0 && autopilotConfig.is_active && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-900">
                Your AI is setting up campaigns and optimizing targeting. Leads should start coming in within 24-48 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Active Campaigns ({campaigns.length})
              </CardTitle>
              <Link to="/app/campaigns">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <Badge
                          variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                        <span>Budget: ${campaign.total_budget?.toLocaleString() || 0}</span>
                        <span>Spent: ${campaign.budget_spent?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Campaigns Message */}
      {campaigns.length === 0 && autopilotConfig?.is_active && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Setting Up Your Campaigns</h3>
                <p className="text-sm text-blue-800 mb-3">
                  The autopilot runs daily at 2 AM UTC. If you just activated it, your first campaigns will be created during the next scheduled run.
                </p>
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>AI analyzes your business description</li>
                  <li>Creates campaigns for optimal channels (LinkedIn, Facebook, etc.)</li>
                  <li>Generates 15-question assessments for lead capture</li>
                  <li>Sets up targeting and budget allocation</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                  Watch the Activity Feed on the right for real-time updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Inbox - Takes 2 columns */}
        <div className="lg:col-span-2">
          <LeadInbox />
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Advanced Mode CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Want to see what's happening under the hood?</h3>
              <p className="text-sm text-gray-600">
                Switch to Advanced Mode to access detailed analytics, campaign controls, and more
              </p>
            </div>
            <Link to="/app/conversational-dashboard">
              <Button variant="outline">
                Switch to Advanced Mode
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <PageHelpModal helpKey="dashboard" />
    </div>
  );
};

export default SimpleDashboard;
