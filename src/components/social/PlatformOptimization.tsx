
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Target, 
  Clock, 
  Hash,
  Users,
  TrendingUp,
  MessageCircle 
} from 'lucide-react';

const PlatformOptimization: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');

  const platformData = {
    linkedin: {
      icon: Linkedin,
      color: 'blue',
      engagement: 12.3,
      followers: 15200,
      bestTime: '10:30 AM',
      bestDay: 'Tuesday',
      insights: [
        'Professional tone increases engagement by 45%',
        'Industry insights perform 67% better',
        'Posts with data/statistics get 89% more shares',
        'B2B content peaks on weekdays'
      ],
      optimization: {
        contentLength: { current: 85, optimal: 150, status: 'good' },
        hashtagCount: { current: 3, optimal: 5, status: 'improve' },
        postFrequency: { current: 4, optimal: 5, status: 'good' },
        visualContent: { current: 60, optimal: 80, status: 'improve' }
      },
      recommendations: [
        'Increase post length to 120-150 words for better engagement',
        'Add 2 more relevant hashtags per post',
        'Include more infographics and charts',
        'Share thought leadership content on industry trends'
      ]
    },
    twitter: {
      icon: Twitter,
      color: 'sky',
      engagement: 8.7,
      followers: 8900,
      bestTime: '2:15 PM',
      bestDay: 'Wednesday',
      insights: [
        'Threads get 3.2x more engagement than single tweets',
        'Real-time commentary performs best',
        'Polls increase interaction by 234%',
        'Hashtag usage should be minimal (1-2 max)'
      ],
      optimization: {
        contentLength: { current: 45, optimal: 280, status: 'improve' },
        hashtagCount: { current: 4, optimal: 2, status: 'reduce' },
        postFrequency: { current: 8, optimal: 5, status: 'reduce' },
        visualContent: { current: 40, optimal: 60, status: 'improve' }
      },
      recommendations: [
        'Use full character limit for better storytelling',
        'Reduce hashtags to 1-2 per tweet',
        'Create more thread content',
        'Post less frequently but with higher quality'
      ]
    },
    facebook: {
      icon: Facebook,
      color: 'indigo',
      engagement: 6.2,
      followers: 12400,
      bestTime: '7:45 PM',
      bestDay: 'Sunday',
      insights: [
        'Community-focused content gets 45% more engagement',
        'Personal stories perform 67% better',
        'Video content gets 3x more reach',
        'Evening posts perform best'
      ],
      optimization: {
        contentLength: { current: 120, optimal: 200, status: 'good' },
        hashtagCount: { current: 8, optimal: 3, status: 'reduce' },
        postFrequency: { current: 3, optimal: 4, status: 'improve' },
        visualContent: { current: 70, optimal: 85, status: 'good' }
      },
      recommendations: [
        'Focus on community building content',
        'Share more behind-the-scenes content',
        'Reduce hashtag usage significantly',
        'Increase posting frequency slightly'
      ]
    },
    instagram: {
      icon: Instagram,
      color: 'pink',
      engagement: 9.1,
      followers: 22100,
      bestTime: '8:30 PM',
      bestDay: 'Friday',
      insights: [
        'Carousel posts get 1.4x more engagement',
        'Stories drive 23% more profile visits',
        'User-generated content increases trust by 78%',
        'Aesthetic consistency improves follower retention'
      ],
      optimization: {
        contentLength: { current: 150, optimal: 125, status: 'reduce' },
        hashtagCount: { current: 15, optimal: 20, status: 'improve' },
        postFrequency: { current: 5, optimal: 6, status: 'improve' },
        visualContent: { current: 95, optimal: 95, status: 'excellent' }
      },
      recommendations: [
        'Keep captions shorter and more engaging',
        'Use all 30 hashtags for maximum reach',
        'Post more consistently (daily)',
        'Maintain your excellent visual strategy'
      ]
    }
  };

  const getOptimizationColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'improve': return 'text-yellow-600';
      case 'reduce': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressValue = (current: number, optimal: number) => {
    return Math.min((current / optimal) * 100, 100);
  };

  const currentPlatform = platformData[selectedPlatform as keyof typeof platformData];
  const Icon = currentPlatform.icon;

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Platform-Specific Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="linkedin" className="flex items-center space-x-2">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center space-x-2">
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center space-x-2">
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              {/* Platform Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Icon className={`h-8 w-8 text-${currentPlatform.color}-600`} />
                    <div>
                      <h2 className="text-2xl font-bold capitalize">{selectedPlatform}</h2>
                      <p className="text-gray-600">Optimization recommendations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <TrendingUp className={`h-6 w-6 mx-auto mb-2 text-${currentPlatform.color}-600`} />
                      <p className="text-2xl font-bold">{currentPlatform.engagement}%</p>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className={`h-6 w-6 mx-auto mb-2 text-${currentPlatform.color}-600`} />
                      <p className="text-2xl font-bold">{currentPlatform.followers.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Followers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className={`h-6 w-6 mx-auto mb-2 text-${currentPlatform.color}-600`} />
                      <p className="text-2xl font-bold">{currentPlatform.bestTime}</p>
                      <p className="text-sm text-gray-600">Best Time</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className={`h-6 w-6 mx-auto mb-2 text-${currentPlatform.color}-600`} />
                      <p className="text-2xl font-bold">{currentPlatform.bestDay}</p>
                      <p className="text-sm text-gray-600">Best Day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(currentPlatform.optimization).map(([key, data]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <Badge className={getOptimizationColor(data.status)}>
                            {data.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Progress value={getProgressValue(data.current, data.optimal)} className="h-2" />
                          </div>
                          <span className="text-sm text-gray-600 min-w-0">
                            {data.current} / {data.optimal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPlatform.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-900">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentPlatform.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <Target className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{recommendation}</p>
                        </div>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformOptimization;
