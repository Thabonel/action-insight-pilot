
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RealTimeSocialMetrics from './RealTimeSocialMetrics';
import LogoMarkIcon from '@/components/LogoMarkIcon';

const EnhancedSocialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  
  // Mock data - replace with actual API calls
  const mockPostIds = ['post_123', 'post_456', 'post_789'];
  const [selectedPosts] = useState(mockPostIds);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Social Intelligence</h2>
          <p className="text-gray-600 mt-1">AI-powered content creation with real-time analytics</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Create A/B Test
          </Button>
          <Button variant="outline" size="sm">
            Generate Images
          </Button>
          <Button size="sm">
            AI Content
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LogoMarkIcon className="h-5 w-5" />
              <div>
                <p className="text-sm text-gray-600">AI Posts Generated</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-purple-600">+12 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">A/B Tests Running</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-blue-600">2 conclusive</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Trending Integration</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-green-600">Hot topics used</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Avg ROI</p>
              <p className="text-2xl font-bold">+47%</p>
              <p className="text-xs text-green-600">Above target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="ai-content">AI Content</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="images">Image Gen</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>Live Performance Metrics</span>
                </CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RealTimeSocialMetrics 
                postIds={selectedPosts} 
                showAggregated={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LogoMarkIcon className="h-5 w-5" />
                  <span>Multi-Model AI Generation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline">Multi-Model AI</Badge>
                  <Badge variant="outline">Auto-Selection</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Content Quality</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement Prediction</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Brand Consistency</span>
                    <span className="font-medium">98%</span>
                  </div>
                </div>

                <Button className="w-full">
                  Generate New Content
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Generations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { platform: 'Instagram', engagement: '+34%' },
                  { platform: 'Twitter', engagement: '+12%' },
                  { platform: 'LinkedIn', engagement: '+28%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.platform}</p>
                      <p className="text-sm text-gray-600">AI Generated</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {item.engagement}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>A/B Test Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Holiday Campaign', status: 'Running', confidence: '87%', winner: 'Variant A' },
                  { name: 'Product Launch', status: 'Completed', confidence: '95%', winner: 'Variant B' },
                  { name: 'Brand Awareness', status: 'Running', confidence: '23%', winner: 'TBD' }
                ].map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-gray-600">Winner: {test.winner}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={test.status === 'Running' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{test.confidence} confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Trending Topics Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Current Trends</h4>
                  <div className="space-y-2">
                    {['#AI2024', '#Sustainability', '#RemoteWork', '#TechInnovation'].map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm font-medium">{trend}</span>
                        <Badge variant="outline" className="text-xs">Hot</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Content Opportunities</h4>
                  <div className="space-y-2">
                    {[
                      'AI productivity tips',
                      'Sustainable business practices',
                      'Remote team collaboration',
                      'Tech predictions 2024'
                    ].map((opportunity, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        {opportunity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>AI Image Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button variant="outline">
                  DALL-E 3
                </Button>
                <Button variant="outline">
                  Stable Diffusion
                </Button>
              </div>

              <div className="text-center p-8 border-dashed border-2 rounded-lg">
                <h3 className="font-medium text-gray-600 mb-2">Generate Platform-Optimized Images</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create custom visuals optimized for each social platform
                </p>
                <Button>Start Creating</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Extended Platform Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'TikTok', status: 'Connected', color: 'green' },
                  { name: 'Pinterest', status: 'Available', color: 'blue' },
                  { name: 'Threads', status: 'Connected', color: 'green' },
                  { name: 'Snapchat', status: 'Available', color: 'blue' }
                ].map((platform, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">{platform.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${platform.color === 'green' ? 'text-green-600 border-green-300' : 'text-blue-600 border-blue-300'}`}
                    >
                      {platform.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSocialDashboard;
