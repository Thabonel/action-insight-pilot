
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ContentPerformanceDashboard: React.FC = () => {
  const [contentLibrary] = useState([
    {
      id: 1,
      title: "10 Marketing Automation Hacks That Actually Work",
      type: "List Article",
      publishDate: "2024-05-28",
      views: 2847,
      engagement: 8.2,
      shares: 124,
      comments: 18,
      score: 94,
      trend: "up",
      performance: "exceptional"
    },
    {
      id: 2,
      title: "Complete Guide to Lead Scoring",
      type: "How-to Guide",
      publishDate: "2024-05-25",
      views: 1923,
      engagement: 6.8,
      shares: 89,
      comments: 12,
      score: 87,
      trend: "up",
      performance: "good"
    },
    {
      id: 3,
      title: "Email Marketing Trends 2024",
      type: "Trend Analysis",
      publishDate: "2024-05-22",
      views: 1456,
      engagement: 5.2,
      shares: 67,
      comments: 8,
      score: 72,
      trend: "down",
      performance: "average"
    },
    {
      id: 4,
      title: "Case Study: 300% ROI Increase",
      type: "Case Study",
      publishDate: "2024-05-20",
      views: 3142,
      engagement: 9.1,
      shares: 156,
      comments: 24,
      score: 96,
      trend: "up",
      performance: "exceptional"
    }
  ]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'exceptional': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-semibold">Case Study: 300% ROI</p>
              <p className="text-sm text-green-600">96% AI score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Best Format</p>
              <p className="text-lg font-semibold">How-to Guides</p>
              <p className="text-sm text-blue-600">87% avg score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Optimal Time</p>
              <p className="text-lg font-semibold">10:30 AM</p>
              <p className="text-sm text-purple-600">+23% engagement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Library */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentLibrary.map((content) => {
              return (
                <div
                  key={content.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {content.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <Badge variant="outline">{content.type}</Badge>
                        <span>{content.publishDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getPerformanceColor(content.performance)}
                        variant="secondary"
                      >
                        {content.score}% score
                      </Badge>
                      <span className={content.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {content.trend === 'up' ? 'Trending up' : 'Trending down'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span>{content.views.toLocaleString()} views</span>
                    </div>
                    <div>
                      <span>{content.engagement}% engagement</span>
                    </div>
                    <div>
                      <span>{content.shares} shares</span>
                    </div>
                    <div>
                      <span>{content.comments} comments</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      Performance: <span className="font-medium capitalize">{content.performance}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Analyze
                      </Button>
                      <Button variant="outline" size="sm">
                        Duplicate
                      </Button>
                      <Button size="sm">
                        Optimize
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPerformanceDashboard;
