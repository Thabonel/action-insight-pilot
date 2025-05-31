
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, Hash, Users, Target, Calendar } from 'lucide-react';

const EngagementPatternAnalysis: React.FC = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('timing');

  const timingData = [
    { hour: '6AM', engagement: 3.2, posts: 12 },
    { hour: '8AM', engagement: 6.8, posts: 23 },
    { hour: '10AM', engagement: 12.3, posts: 18 },
    { hour: '12PM', engagement: 8.9, posts: 35 },
    { hour: '2PM', engagement: 10.1, posts: 28 },
    { hour: '4PM', engagement: 7.4, posts: 31 },
    { hour: '6PM', engagement: 9.2, posts: 22 },
    { hour: '8PM', engagement: 11.8, posts: 15 },
    { hour: '10PM', engagement: 5.3, posts: 8 }
  ];

  const contentTypeData = [
    { type: 'Video', engagement: 14.2, posts: 23, color: '#8884d8' },
    { type: 'Images', engagement: 9.7, posts: 67, color: '#82ca9d' },
    { type: 'Text', engagement: 6.8, posts: 89, color: '#ffc658' },
    { type: 'Carousel', engagement: 11.3, posts: 34, color: '#ff7300' },
    { type: 'Stories', engagement: 8.2, posts: 45, color: '#00ff00' }
  ];

  const hashtagPerformance = [
    { tag: '#MarketingTips', usage: 45, avgEngagement: 12.3, topPost: '15.6%' },
    { tag: '#AI', usage: 38, avgEngagement: 11.8, topPost: '14.2%' },
    { tag: '#Business', usage: 67, avgEngagement: 8.9, topPost: '13.1%' },
    { tag: '#Innovation', usage: 29, avgEngagement: 10.7, topPost: '12.8%' },
    { tag: '#Technology', usage: 52, avgEngagement: 9.4, topPost: '11.9%' }
  ];

  const audienceInsights = [
    { metric: 'Peak Activity Hours', value: '10AM - 12PM, 8PM - 10PM', trend: '+15%' },
    { metric: 'Most Active Day', value: 'Thursday', trend: '23% higher' },
    { metric: 'Engagement Growth', value: '+18% monthly', trend: 'Improving' },
    { metric: 'New Followers', value: '1,247 this month', trend: '+12%' }
  ];

  const platformOptimalTimes = [
    { platform: 'LinkedIn', bestTime: '10:30 AM', engagement: '12.3%', dayOfWeek: 'Tuesday' },
    { platform: 'Twitter', bestTime: '2:15 PM', engagement: '8.7%', dayOfWeek: 'Wednesday' },
    { platform: 'Facebook', bestTime: '7:45 PM', engagement: '6.2%', dayOfWeek: 'Sunday' },
    { platform: 'Instagram', bestTime: '8:30 PM', engagement: '9.1%', dayOfWeek: 'Friday' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
          <TabsTrigger value="content">Content Types</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtag Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="timing" className="space-y-6">
          {/* Optimal Posting Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Optimal Posting Times</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="engagement" fill="#8884d8" name="Engagement %" />
                    <Bar yAxisId="right" dataKey="posts" fill="#82ca9d" name="Posts Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform-Specific Times */}
          <Card>
            <CardHeader>
              <CardTitle>Platform-Specific Optimal Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformOptimalTimes.map((platform, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{platform.platform}</h3>
                      <Badge variant="secondary">{platform.engagement}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best time:</span>
                        <span className="font-medium">{platform.bestTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best day:</span>
                        <span className="font-medium">{platform.dayOfWeek}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Type Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Type Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentTypeData}
                        dataKey="engagement"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {contentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentTypeData.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{type.engagement}% engagement</div>
                        <div className="text-sm text-gray-600">{type.posts} posts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-6">
          {/* Hashtag Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Hashtag Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hashtagPerformance.map((hashtag, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-blue-600">{hashtag.tag}</span>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{hashtag.usage} uses</Badge>
                        <Badge variant="secondary">{hashtag.avgEngagement}% avg</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Usage Count</p>
                        <p className="font-medium">{hashtag.usage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Engagement</p>
                        <p className="font-medium">{hashtag.avgEngagement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Top Performance</p>
                        <p className="font-medium">{hashtag.topPost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          {/* Audience Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Audience Behavior Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audienceInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{insight.metric}</h3>
                      <Badge variant="outline">{insight.trend}</Badge>
                    </div>
                    <p className="text-lg font-semibold">{insight.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Viral Content Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Viral Content Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">What Makes Content Go Viral</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Video content posted at 10:30 AM on weekdays</li>
                    <li>• Posts with 3-5 hashtags perform best</li>
                    <li>• Questions in captions increase engagement by 34%</li>
                    <li>• Behind-the-scenes content gets 2.3x more shares</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Audience Preferences</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• 67% prefer visual content over text-only posts</li>
                    <li>• Educational content gets 45% more saves</li>
                    <li>• Personal stories increase connection by 89%</li>
                    <li>• How-to content generates most comments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EngagementPatternAnalysis;
