import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  DollarSign,
  Pause,
  Play,
  Settings as SettingsIcon,
  Download,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LeadInbox from '@/components/autopilot/LeadInbox';
import ActivityFeed from '@/components/autopilot/ActivityFeed';
import { Link } from 'react-router-dom';

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
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      setAutopilotConfig(configData);

      // Fetch dashboard stats using the database function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_autopilot_dashboard_stats', { p_user_id: user?.id });

      if (statsError) throw statsError;

      setStats(statsData || stats);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error toggling autopilot:', error);
      toast({
        title: 'Failed to update autopilot',
        description: error.message,
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
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Marketing Autopilot</h2>
            <p className="text-gray-600 mb-6">
              Let AI handle your marketing automatically while you focus on your business
            </p>
            <Link to="/app/autopilot/setup">
              <Button size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
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
          <Link to="/app/autopilot/settings">
            <Button variant="outline" size="sm">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button
            variant={autopilotConfig.is_active ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleAutopilot}
          >
            {autopilotConfig.is_active ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Autopilot
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Autopilot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {!autopilotConfig.is_active && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Pause className="h-5 w-5 text-yellow-600" />
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
                <Users className="h-5 w-5 text-blue-600" />
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
                <DollarSign className="h-5 w-5 text-purple-600" />
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
                <TrendingUp className="h-5 w-5 text-green-600" />
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
                <Sparkles className="inline h-4 w-4 mr-1" />
                Your AI is setting up campaigns and optimizing targeting. Leads should start coming in within 24-48 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default SimpleDashboard;
