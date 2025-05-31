
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Users } from 'lucide-react';

const SocialPerformanceDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  const platformData = [
    { platform: 'LinkedIn', posts: 45, engagement: 12.3, followers: 15200, conversions: 23 },
    { platform: 'Twitter', posts: 89, engagement: 8.7, followers: 8900, conversions: 12 },
    { platform: 'Facebook', posts: 34, engagement: 6.2, followers: 12400, conversions: 8 },
    { platform: 'Instagram', posts: 67, engagement: 9.1, followers: 22100, conversions: 15 }
  ];

  const engagementTrend = [
    { date: 'Mon', linkedin: 12.3, twitter: 8.7, facebook: 6.2, instagram: 9.1 },
    { date: 'Tue', linkedin: 13.1, twitter: 9.2, facebook: 6.8, instagram: 10.3 },
    { date: 'Wed', linkedin: 11.8, twitter: 8.9, facebook: 5.9, instagram: 9.7 },
    { date: 'Thu', linkedin: 14.2, twitter: 10.1, facebook: 7.3, instagram: 11.2 },
    { date: 'Fri', linkedin: 13.9, twitter: 9.8, facebook: 6.9, instagram: 10.8 },
    { date: 'Sat', linkedin: 10.2, twitter: 7.3, facebook: 8.1, instagram: 12.4 },
    { date: 'Sun', linkedin: 9.8, twitter: 6.9, facebook: 7.8, instagram: 11.9 }
  ];

  const topPosts = [
    {
      id: 1,
      platform: 'LinkedIn',
      content: 'How AI is transforming marketing automation...',
      engagement: '15.6%',
      likes: 342,
      comments: 89,
      shares: 156,
      views: 12400,
      type: 'Article'
    },
    {
      id: 2,
      platform: 'Instagram',
      content: 'Behind the scenes of our product development...',
      engagement: '13.2%',
      likes: 567,
      comments: 134,
      shares: 89,
      views: 8900,
      type: 'Video'
    },
    {
      id: 3,
      platform: 'Twitter',
      content: 'Thread: 10 marketing automation tips...',
      engagement: '11.8%',
      likes: 234,
      comments: 67,
      shares: 123,
      views: 5600,
      type: 'Thread'
    }
  ];

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return 'text-blue-600';
      case 'twitter': return 'text-sky-600';
      case 'facebook': return 'text-indigo-600';
      case 'instagram': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Platform Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformData.map((platform, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-medium ${getPlatformColor(platform.platform)}`}>
                    {platform.platform}
                  </h3>
                  <Badge variant="secondary">{platform.posts} posts</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement:</span>
                    <span className="font-medium">{platform.engagement}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Followers:</span>
                    <span className="font-medium">{platform.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversions:</span>
                    <span className="font-medium">{platform.conversions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="linkedin" stroke="#2563eb" name="LinkedIn" />
                <Line type="monotone" dataKey="twitter" stroke="#0284c7" name="Twitter" />
                <Line type="monotone" dataKey="facebook" stroke="#4f46e5" name="Facebook" />
                <Line type="monotone" dataKey="instagram" stroke="#ec4899" name="Instagram" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Performing Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPlatformColor(post.platform)}>
                        {post.platform}
                      </Badge>
                      <Badge variant="outline">{post.type}</Badge>
                      <Badge variant="secondary">{post.engagement} engagement</Badge>
                    </div>
                    <p className="text-gray-800 mb-3">{post.content}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                    <p className="text-sm font-medium">{post.likes}</p>
                    <p className="text-xs text-gray-600">Likes</p>
                  </div>
                  <div>
                    <MessageCircle className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-medium">{post.comments}</p>
                    <p className="text-xs text-gray-600">Comments</p>
                  </div>
                  <div>
                    <Share2 className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    <p className="text-sm font-medium">{post.shares}</p>
                    <p className="text-xs text-gray-600">Shares</p>
                  </div>
                  <div>
                    <Eye className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                    <p className="text-sm font-medium">{post.views.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline">Duplicate Post</Button>
                  <Button size="sm" variant="outline">Create Similar</Button>
                  <Button size="sm" variant="outline">Analyze Performance</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPerformanceDashboard;
