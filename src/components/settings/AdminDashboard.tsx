
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SupportTickets from './SupportTickets';
import { AIModelManager } from '@/components/admin/AIModelManager';

const AdminDashboard: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [systemStatus] = useState({
    api: 'healthy',
    database: 'healthy',
    ai: 'degraded',
    integrations: 'healthy'
  });

  // OpenClaw state
  const [openclawPercentage, setOpenclawPercentage] = useState(10);
  const [openclawStatus, setOpenclawStatus] = useState<{
    hybrid_service?: { openclaw_percentage: number; fallback_enabled: boolean; status: string };
    openclaw?: { available: boolean; model: string };
    legacy?: { available: boolean };
  } | null>(null);
  const [openclawLoading, setOpenclawLoading] = useState(true);
  const [openclawSaving, setOpenclawSaving] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Fetch OpenClaw status on mount
  useEffect(() => {
    const fetchOpenclawStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/agents/openclaw/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setOpenclawStatus(data.data);
            if (data.data.hybrid_service?.openclaw_percentage !== undefined) {
              setOpenclawPercentage(data.data.hybrid_service.openclaw_percentage);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch OpenClaw status:', error);
      } finally {
        setOpenclawLoading(false);
      }
    };

    if (session?.access_token) {
      fetchOpenclawStatus();
    }
  }, [session?.access_token, BACKEND_URL]);

  // Save OpenClaw percentage
  const handleSaveOpenclawPercentage = async () => {
    setOpenclawSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/agents/openclaw/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ percentage: openclawPercentage })
      });

      if (!response.ok) {
        throw new Error('Failed to update OpenClaw configuration');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'OpenClaw Configuration Updated',
          description: `Traffic routing set to ${openclawPercentage}% OpenClaw, ${100 - openclawPercentage}% Legacy`
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to save OpenClaw configuration:', error);
      toast({
        title: 'Configuration Failed',
        description: 'Unable to update OpenClaw routing. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setOpenclawSaving(false);
    }
  };

  const systemMetrics = [
    { label: 'Total Users', value: '2,847', change: '+12%', color: 'blue' },
    { label: 'Active Workspaces', value: '423', change: '+8%', color: 'green' },
    { label: 'Monthly Revenue', value: '$84,230', change: '+15%', color: 'purple' },
    { label: 'API Requests', value: '1.2M', change: '+22%', color: 'orange' }
  ];

  const recentUsers = [
    { id: 1, name: 'TechCorp Inc.', users: 25, plan: 'Enterprise', status: 'active', revenue: '$2,500' },
    { id: 2, name: 'StartupXYZ', users: 8, plan: 'Pro', status: 'active', revenue: '$400' },
    { id: 3, name: 'Marketing Agency', users: 15, plan: 'Business', status: 'trial', revenue: '$0' },
    { id: 4, name: 'E-commerce Co', users: 12, plan: 'Pro', status: 'active', revenue: '$600' }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'AI service response time elevated', time: '5 minutes ago' },
    { id: 2, type: 'info', message: 'Scheduled maintenance completed', time: '2 hours ago' },
    { id: 3, type: 'error', message: 'Payment processor temporarily unavailable', time: '1 day ago' }
  ];

  const usageStats = [
    { feature: 'Content Generation', usage: 85, limit: 100 },
    { feature: 'Campaign Creation', usage: 67, limit: 100 },
    { feature: 'Analytics Queries', usage: 92, limit: 100 },
    { feature: 'API Calls', usage: 78, limit: 100 }
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map(metric => {
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="openclaw">OpenClaw</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-${getStatusColor(status)}-600 border-${getStatusColor(status)}-300`}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Resource Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.map(stat => (
                  <div key={stat.feature}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{stat.feature}</span>
                      <span className="text-sm text-gray-600">{stat.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stat.usage > 90 ? 'bg-red-500' :
                          stat.usage > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${stat.usage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'bg-red-50 border-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{alert.message}</p>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Recent Workspaces</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Workspace</th>
                      <th className="text-left py-3 px-4">Users</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.users} users</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{user.plan}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`${
                            user.status === 'active' ? 'text-green-600 border-green-300' :
                            user.status === 'trial' ? 'text-blue-600 border-blue-300' :
                            'text-gray-600 border-gray-300'
                          }`}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{user.revenue}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">Manage</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Revenue Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">$84,230</div>
                  <div className="text-sm text-green-600">Monthly Revenue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">$12,456</div>
                  <div className="text-sm text-blue-600">Outstanding</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">94.2%</div>
                  <div className="text-sm text-purple-600">Collection Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-models" className="space-y-6">
          <AIModelManager />
        </TabsContent>

        <TabsContent value="openclaw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OpenClaw AI Integration</CardTitle>
              <CardDescription>
                Control the percentage of AI tasks routed to OpenClaw vs Legacy agents.
                Use this for A/B testing and gradual rollout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {openclawLoading ? (
                <div className="text-center py-8 text-gray-500">Loading OpenClaw status...</div>
              ) : (
                <>
                  {/* Traffic Routing Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Traffic Routing</span>
                      <span className="text-sm text-gray-600">
                        {openclawPercentage}% OpenClaw / {100 - openclawPercentage}% Legacy
                      </span>
                    </div>
                    <Slider
                      value={[openclawPercentage]}
                      onValueChange={(value) => setOpenclawPercentage(value[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0% (Legacy Only)</span>
                      <span>50% (A/B Test)</span>
                      <span>100% (OpenClaw Only)</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={openclawPercentage === 0 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOpenclawPercentage(0)}
                    >
                      Legacy Only
                    </Button>
                    <Button
                      variant={openclawPercentage === 10 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOpenclawPercentage(10)}
                    >
                      10% Test
                    </Button>
                    <Button
                      variant={openclawPercentage === 50 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOpenclawPercentage(50)}
                    >
                      50/50 Split
                    </Button>
                    <Button
                      variant={openclawPercentage === 100 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOpenclawPercentage(100)}
                    >
                      OpenClaw Only
                    </Button>
                  </div>

                  {/* Status Display */}
                  {openclawStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Hybrid Service</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={
                            openclawStatus.hybrid_service?.status === 'active'
                              ? 'text-green-600 border-green-300'
                              : 'text-yellow-600 border-yellow-300'
                          }>
                            {openclawStatus.hybrid_service?.status || 'Unknown'}
                          </Badge>
                          {openclawStatus.hybrid_service?.fallback_enabled && (
                            <span className="text-xs text-gray-500">Fallback enabled</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">OpenClaw Engine</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={
                            openclawStatus.openclaw?.available
                              ? 'text-green-600 border-green-300'
                              : 'text-red-600 border-red-300'
                          }>
                            {openclawStatus.openclaw?.available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {openclawStatus.openclaw?.model && (
                            <span className="text-xs text-gray-500">{openclawStatus.openclaw.model}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Legacy Agents</div>
                        <Badge variant="outline" className={
                          openclawStatus.legacy?.available
                            ? 'text-green-600 border-green-300'
                            : 'text-red-600 border-red-300'
                        }>
                          {openclawStatus.legacy?.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSaveOpenclawPercentage}
                      disabled={openclawSaving}
                      className="w-full md:w-auto"
                    >
                      {openclawSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
