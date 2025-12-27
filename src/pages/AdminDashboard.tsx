
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { TrendingUp, Users, Mail, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const AdminDashboard: React.FC = () => {
  const { campaigns, isLoading, error } = useCampaigns();

  // Sample data for admin metrics - in a real app, this would come from actual API calls
  const businessMetrics = {
    totalRevenue: 125000,
    revenueGrowth: 12.5,
    totalUsers: 2847,
    userGrowth: 8.3,
    emailsSent: 45632,
    emailGrowth: 15.7,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length
  };

  const revenueData = [
    { month: 'Jan', revenue: 98000, users: 2200 },
    { month: 'Feb', revenue: 105000, users: 2350 },
    { month: 'Mar', revenue: 112000, users: 2500 },
    { month: 'Apr', revenue: 118000, users: 2650 },
    { month: 'May', revenue: 122000, users: 2750 },
    { month: 'Jun', revenue: 125000, users: 2847 }
  ];

  const systemHealth = [
    { name: 'API Response Time', value: 95, status: 'good' },
    { name: 'Database Performance', value: 87, status: 'good' },
    { name: 'Email Delivery Rate', value: 98, status: 'excellent' },
    { name: 'User Satisfaction', value: 92, status: 'excellent' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Business metrics and system overview</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${businessMetrics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{businessMetrics.revenueGrowth}% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{businessMetrics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{businessMetrics.userGrowth}% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{businessMetrics.emailsSent.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{businessMetrics.emailGrowth}% from last month</p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{businessMetrics.activeCampaigns}</p>
                <p className="text-sm text-gray-500">Across all users</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              {systemHealth.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.status === 'excellent' ? 'bg-green-600' : 
                          metric.status === 'good' ? 'bg-blue-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{metric.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">New user registration spike</p>
                <p className="text-xs text-gray-500">15 new users in the last hour</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email campaign completed</p>
                <p className="text-xs text-gray-500">Summer Sale campaign reached 25K recipients</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Revenue milestone reached</p>
                <p className="text-xs text-gray-500">Monthly revenue exceeded $125K target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PageHelpModal helpKey="adminDashboard" />
    </div>
  );
};

export default AdminDashboard;
