
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  BarChart3, 
  Calendar,
  DollarSign,
  Target,
  Shield,
  Settings,
  Activity
} from 'lucide-react';
import { useEmailMetrics } from '@/hooks/useEmailMetrics';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { useCampaigns } from '@/hooks/useCampaigns';

const AdminDashboard: React.FC = () => {
  const { metrics: emailMetrics, loading: emailLoading } = useEmailMetrics();
  const { metrics: realTimeMetrics, loading: realTimeLoading } = useRealTimeMetrics();
  const { campaigns, loading: campaignsLoading } = useCampaigns();

  // System-wide metrics (admin-level data)
  const totalRevenue = 45231.89;
  const activeCampaigns = campaigns?.length || 12;
  const totalUsers = 2350;
  const systemUptime = 99.8;

  const revenueChange = 20.1;
  const campaignsChange = 2;
  const usersChange = 180;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600 mt-1">System overview and business metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Key Business Metrics */}
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
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaignsLoading ? '...' : activeCampaigns}
              </div>
              <p className="text-xs text-muted-foreground">
                +{campaignsChange} from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Emails Sent</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{usersChange} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemUptime}%</div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {emailMetrics?.openRate ? (emailMetrics.openRate * 100).toFixed(1) : '25.0'}%
                </div>
                <p className="text-sm text-gray-600">Avg Email Open Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {emailMetrics?.clickRate ? (emailMetrics.clickRate * 100).toFixed(1) : '5.0'}%
                </div>
                <p className="text-sm text-gray-600">Avg Email Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="email">Email Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Active Campaigns:</span>
                    <Badge variant="secondary">{activeCampaigns}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Draft Campaigns:</span>
                    <Badge variant="outline">
                      {campaigns?.filter(c => c.status === 'draft').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed Campaigns:</span>
                    <Badge variant="default">
                      {campaigns?.filter(c => c.status === 'completed').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Registered Users:</span>
                    <Badge variant="secondary">{totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active This Month:</span>
                    <Badge variant="default">{Math.floor(totalUsers * 0.7)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Users This Month:</span>
                    <Badge variant="outline">{usersChange}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailLoading ? (
                    <p>Loading email metrics...</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Total Emails Sent:</span>
                        <Badge variant="secondary">{emailMetrics?.totalSent || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Delivered:</span>
                        <Badge variant="default">{emailMetrics?.delivered || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bounced:</span>
                        <Badge variant="destructive">{emailMetrics?.bounced || 0}</Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>System Status:</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uptime:</span>
                    <Badge variant="secondary">{systemUptime}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Backup:</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
