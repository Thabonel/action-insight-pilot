
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface BlogAnalyticsDashboardProps {
  selectedBlogId?: string;
}

const BlogAnalyticsDashboard: React.FC<BlogAnalyticsDashboardProps> = ({ selectedBlogId }) => {
  const [performanceData] = useState([
    { date: '2024-01', views: 1200, engagement: 65, conversions: 12 },
    { date: '2024-02', views: 1800, engagement: 72, conversions: 18 },
    { date: '2024-03', views: 2200, engagement: 68, conversions: 25 },
    { date: '2024-04', views: 1950, engagement: 75, conversions: 22 },
    { date: '2024-05', views: 2800, engagement: 82, conversions: 35 },
    { date: '2024-06', views: 3200, engagement: 78, conversions: 42 }
  ]);

  const [topPosts] = useState([
    {
      id: '1',
      title: '10 Marketing Automation Best Practices',
      views: 5420,
      engagement: 8.5,
      shares: 124,
      conversions: 18,
      roi: 340,
      trending: 'up' as const
    },
    {
      id: '2',
      title: 'Complete Guide to Lead Scoring',
      views: 3890,
      engagement: 7.2,
      shares: 89,
      conversions: 15,
      roi: 280,
      trending: 'stable' as const
    },
    {
      id: '3',
      title: 'Email Marketing Trends 2024',
      views: 2100,
      engagement: 5.8,
      shares: 45,
      conversions: 8,
      roi: 150,
      trending: 'down' as const
    }
  ]);

  const [trafficSources] = useState([
    { name: 'Organic Search', value: 45, color: '#8884d8' },
    { name: 'Social Media', value: 25, color: '#82ca9d' },
    { name: 'Direct', value: 20, color: '#ffc658' },
    { name: 'Referral', value: 10, color: '#ff7300' }
  ]);

  const [keywords] = useState([
    { keyword: 'marketing automation', impressions: 12500, clicks: 890, position: 3.2, ctr: 7.1 },
    { keyword: 'lead scoring', impressions: 8900, clicks: 623, position: 2.8, ctr: 7.0 },
    { keyword: 'email marketing', impressions: 15200, clicks: 1050, position: 4.1, ctr: 6.9 },
    { keyword: 'content marketing', impressions: 11800, clicks: 756, position: 3.9, ctr: 6.4 }
  ]);

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return <span className="text-green-600">[+]</span>;
      case 'down': return <span className="text-red-600">[-]</span>;
      default: return <span className="text-gray-600">[=]</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">24.7K</p>
                <p className="text-xs text-green-600 flex items-center">
                  +12% this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">7.8%</p>
                <p className="text-xs text-green-600">Above average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-green-600 flex items-center">
                  +8% this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">284%</p>
                <p className="text-xs text-green-600">Strong performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{post.title}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>{post.views.toLocaleString()} views</span>
                          <span>{post.engagement}% engagement</span>
                          <span>{post.conversions} conversions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={post.roi > 250 ? 'default' : 'secondary'}>
                          {post.roi}% ROI
                        </Badge>
                        {getTrendText(post.trending)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Views</span>
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                        <Progress value={(post.views / 6000) * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Engagement</span>
                          <span>{post.engagement}%</span>
                        </div>
                        <Progress value={post.engagement * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Conversions</span>
                          <span>{post.conversions}</span>
                        </div>
                        <Progress value={(post.conversions / 20) * 100} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywords.map((keyword, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 border rounded-lg items-center">
                    <div className="font-medium">{keyword.keyword}</div>
                    <div className="text-sm text-muted-foreground">
                      {keyword.impressions.toLocaleString()} impressions
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {keyword.clicks} clicks
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pos. {keyword.position}
                    </div>
                    <div className="text-sm font-medium">
                      {keyword.ctr}% CTR
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-800">Update Old Content</h4>
                    <Badge variant="secondary">High Priority</Badge>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    3 posts from 2023 need content refresh for better SEO performance
                  </p>
                  <Button size="sm" variant="outline">
                    Review Posts
                  </Button>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">A/B Test Titles</h4>
                    <Badge variant="secondary">Medium Priority</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Test different title variations for "Email Marketing Trends 2024"
                  </p>
                  <Button size="sm" variant="outline">
                    Set Up Test
                  </Button>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">Cross-Promotion</h4>
                    <Badge variant="secondary">Low Priority</Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Link related automation posts to increase engagement
                  </p>
                  <Button size="sm" variant="outline">
                    Add Links
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Content Investment</div>
                    <div className="text-2xl font-bold">$2,400</div>
                    <div className="text-muted-foreground">Writing + Promotion</div>
                  </div>
                  <div>
                    <div className="font-medium">Revenue Generated</div>
                    <div className="text-2xl font-bold text-green-600">$8,950</div>
                    <div className="text-muted-foreground">From 127 conversions</div>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total ROI</span>
                    <span className="text-2xl font-bold text-green-600">373%</span>
                  </div>
                  <Progress value={75} className="mt-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on average customer lifetime value of $70
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogAnalyticsDashboard;
