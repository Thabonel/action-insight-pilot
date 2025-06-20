
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Palette, Target, Zap, TrendingUp } from 'lucide-react';

const CreativeAnalytics: React.FC = () => {
  const [activeView, setActiveView] = useState<'elements' | 'themes' | 'performance'>('elements');

  // Mock data for creative elements analysis
  const [creativeElements] = useState([
    { element: 'Call-to-Action Buttons', usage: 85, performance: 92, color: '#3B82F6' },
    { element: 'Video Content', usage: 78, performance: 88, color: '#10B981' },
    { element: 'User Testimonials', usage: 65, performance: 94, color: '#8B5CF6' },
    { element: 'Product Demos', usage: 72, performance: 86, color: '#F59E0B' },
    { element: 'Before/After Images', usage: 45, performance: 90, color: '#EF4444' }
  ]);

  const [themeData] = useState([
    { name: 'Professional', value: 35, color: '#3B82F6' },
    { name: 'Casual', value: 25, color: '#10B981' },
    { name: 'Urgency', value: 20, color: '#EF4444' },
    { name: 'Educational', value: 15, color: '#8B5CF6' },
    { name: 'Emotional', value: 5, color: '#F59E0B' }
  ]);

  const [performanceData] = useState([
    { metric: 'Click-through Rate', competitor: 3.2, industry: 2.8, yours: 3.8 },
    { metric: 'Engagement Rate', competitor: 4.1, industry: 3.5, yours: 4.6 },
    { metric: 'Conversion Rate', competitor: 2.7, industry: 2.3, yours: 3.1 },
    { metric: 'Cost per Click', competitor: 1.85, industry: 2.10, yours: 1.60 }
  ]);

  const getPerformanceColor = (value: number, baseline: number) => {
    if (value > baseline * 1.1) return 'text-green-600';
    if (value < baseline * 0.9) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-orange-600" />
            <span>Creative Analytics</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={activeView === 'elements' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('elements')}
            >
              Elements
            </Button>
            <Button
              variant={activeView === 'themes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('themes')}
            >
              Themes
            </Button>
            <Button
              variant={activeView === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('performance')}
            >
              Performance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeView === 'elements' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Creative Element Analysis</h4>
              <div className="space-y-3">
                {creativeElements.map((element, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{element.element}</span>
                      <Badge 
                        variant="outline" 
                        className={getPerformanceColor(element.performance, 85)}
                      >
                        {element.performance}% effective
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>Usage Rate</span>
                          <span>{element.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${element.usage}%`, 
                              backgroundColor: element.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Top Performing Elements</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• User testimonials show 94% effectiveness across competitors</li>
                <li>• Video content drives 23% higher engagement than static images</li>
                <li>• Call-to-action buttons with urgency words perform 18% better</li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'themes' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Creative Theme Distribution</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={themeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {themeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {themeData.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{theme.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Theme Insights</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Professional themes dominate B2B campaigns (35%)</li>
                <li>• Urgency themes peak during holiday seasons</li>
                <li>• Educational content shows highest retention rates</li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'performance' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Performance Benchmarking</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="yours" fill="#10B981" name="Your Performance" />
                  <Bar dataKey="competitor" fill="#EF4444" name="Top Competitor" />
                  <Bar dataKey="industry" fill="#6B7280" name="Industry Average" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Strengths</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 22% above industry average CTR</li>
                  <li>• Lower cost per click than competitors</li>
                  <li>• Strong engagement rates</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Opportunities</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Conversion rate can be improved</li>
                  <li>• Test more video content formats</li>
                  <li>• Experiment with urgency themes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-purple-900">AI Recommendations</h4>
          </div>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Incorporate user testimonials in your next campaign (+12% expected lift)</li>
            <li>• Test urgency-themed creatives during peak seasons</li>
            <li>• Consider video format for product demo ads</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreativeAnalytics;
