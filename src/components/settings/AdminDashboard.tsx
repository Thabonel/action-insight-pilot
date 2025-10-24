
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  Server,
  Database,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import SupportTickets from './SupportTickets';

const AdminDashboard: React.FC = () => {
  const [systemStatus] = useState({
    api: 'healthy',
    database: 'healthy',
    ai: 'degraded',
    integrations: 'healthy'
  });

  const systemMetrics = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Active Workspaces', value: '423', change: '+8%', icon: Shield, color: 'green' },
    { label: 'Monthly Revenue', value: '$84,230', change: '+15%', icon: DollarSign, color: 'purple' },
    { label: 'API Requests', value: '1.2M', change: '+22%', icon: Activity, color: 'orange' }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
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
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                  <div className={`p-3 bg-${metric.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {service === 'api' && <Activity className="h-5 w-5" />}
                      {service === 'database' && <Database className="h-5 w-5" />}
                      {service === 'ai' && <Zap className="h-5 w-5" />}
                      {service === 'integrations' && <Shield className="h-5 w-5" />}
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
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
                <TrendingUp className="h-5 w-5" />
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
                <AlertTriangle className="h-5 w-5" />
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
                <Users className="h-5 w-5" />
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
                <DollarSign className="h-5 w-5" />
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

        <TabsContent value="support" className="space-y-6">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
