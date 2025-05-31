
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp,
  FileText,
  Calendar,
  Search,
  Lightbulb
} from 'lucide-react';

const ContentOptimizationPanel: React.FC = () => {
  const [optimizationInsights] = useState({
    bestFormats: [
      { type: 'How-to Guides', score: 94, change: '+12%' },
      { type: 'List Articles', score: 87, change: '+8%' },
      { type: 'Case Studies', score: 82, change: '+15%' },
      { type: 'Tutorials', score: 79, change: '+5%' }
    ],
    contentLength: {
      optimal: '800-1200 words',
      performance: '+23% engagement',
      current: '945 words avg'
    },
    bestTopics: [
      { topic: 'Marketing Automation', score: 96, trend: 'up' },
      { topic: 'Lead Generation', score: 89, trend: 'up' },
      { topic: 'Email Marketing', score: 84, trend: 'stable' },
      { topic: 'Analytics & Reporting', score: 78, trend: 'down' }
    ],
    publishingTimes: [
      { time: '10:30 AM', performance: '+23%', day: 'Tuesday' },
      { time: '2:15 PM', performance: '+18%', day: 'Wednesday' },
      { time: '11:00 AM', performance: '+15%', day: 'Thursday' }
    ]
  });

  const [seoInsights] = useState({
    topKeywords: [
      { keyword: 'marketing automation', volume: 2400, difficulty: 'Medium' },
      { keyword: 'lead generation', volume: 1900, difficulty: 'High' },
      { keyword: 'email marketing', volume: 3200, difficulty: 'Medium' },
      { keyword: 'content marketing', volume: 2100, difficulty: 'Low' }
    ],
    opportunities: [
      'Add more internal links to boost SEO score',
      'Include FAQ sections for better search visibility',
      'Optimize meta descriptions for higher CTR'
    ]
  });

  return (
    <div className="space-y-6">
      {/* Content Format Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Best Performing Content Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationInsights.bestFormats.map((format, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{format.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{format.score}% score</Badge>
                  <span className="text-sm text-green-600">{format.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Length Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Content Length Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Optimal Length</p>
              <p className="text-xl font-bold text-green-900">{optimizationInsights.contentLength.optimal}</p>
              <p className="text-sm text-green-600">{optimizationInsights.contentLength.performance}</p>
            </div>
            <div className="text-sm text-gray-600">
              Current average: {optimizationInsights.contentLength.current}
            </div>
          </CardContent>
        </Card>

        {/* Publishing Time Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span>Optimal Publishing Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizationInsights.publishingTimes.map((time, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{time.day} {time.time}</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600">
                    {time.performance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>Topic Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationInsights.bestTopics.map((topic, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{topic.topic}</span>
                  <Badge variant="secondary">{topic.score}% score</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`h-4 w-4 ${
                    topic.trend === 'up' ? 'text-green-500' : 
                    topic.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{topic.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>SEO Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Keywords</h4>
            <div className="space-y-2">
              {seoInsights.topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{keyword.keyword}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{keyword.volume} searches/month</span>
                    <Badge 
                      variant={keyword.difficulty === 'Low' ? 'default' : 
                              keyword.difficulty === 'Medium' ? 'secondary' : 'outline'}
                    >
                      {keyword.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Optimization Opportunities</h4>
            <div className="space-y-2">
              {seoInsights.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-blue-800">{opportunity}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentOptimizationPanel;
