
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share, Calendar, TrendingUp, Target } from 'lucide-react';

const ReportingFeatures: React.FC = () => {
  const [availableReports] = useState([
    {
      id: 1,
      title: 'Executive Summary',
      description: 'High-level overview with AI insights for leadership',
      type: 'executive',
      frequency: 'Weekly',
      lastGenerated: '2 days ago',
      insights: ['Revenue up 23%', 'Email ROI improved', 'Social engagement declining'],
      icon: TrendingUp
    },
    {
      id: 2,
      title: 'Channel Performance Deep Dive',
      description: 'Detailed analysis of each marketing channel',
      type: 'channel',
      frequency: 'Monthly',
      lastGenerated: '5 days ago',
      insights: ['Email top performer', 'Social needs optimization', 'Content shows growth'],
      icon: Target
    },
    {
      id: 3,
      title: 'ROI Analysis by Campaign Type',
      description: 'Return on investment breakdown across campaign categories',
      type: 'roi',
      frequency: 'Bi-weekly',
      lastGenerated: '1 week ago',
      insights: ['Product demos highest ROI', 'Educational content growing', 'Promotional declining'],
      icon: FileText
    },
    {
      id: 4,
      title: 'Conversion Funnel Optimization',
      description: 'Analysis of conversion paths and bottlenecks',
      type: 'funnel',
      frequency: 'Monthly',
      lastGenerated: '3 days ago',
      insights: ['Landing page conversion up', 'Email-to-demo path optimized', 'Social funnel needs work'],
      icon: TrendingUp
    }
  ]);

  const [customMetrics] = useState([
    { name: 'Customer Acquisition Cost', value: '$45', trend: 'down', change: '-12%' },
    { name: 'Lifetime Value', value: '$2,340', trend: 'up', change: '+18%' },
    { name: 'Lead Velocity Rate', value: '23/month', trend: 'up', change: '+7%' },
    { name: 'Marketing Qualified Leads', value: '156', trend: 'up', change: '+24%' }
  ]);

  const [scheduledReports] = useState([
    { name: 'Weekly Executive Brief', nextDate: 'Monday 9:00 AM', recipients: 3 },
    { name: 'Monthly Performance Review', nextDate: 'First Monday', recipients: 7 },
    { name: 'Quarterly Business Review', nextDate: 'Jan 1st', recipients: 12 }
  ]);

  // Ensure all arrays are safely handled
  const safeAvailableReports = Array.isArray(availableReports) ? availableReports : [];
  const safeCustomMetrics = Array.isArray(customMetrics) ? customMetrics : [];
  const safeScheduledReports = Array.isArray(scheduledReports) ? scheduledReports : [];

  const handleGenerateReport = (_reportId: number) => {
    // Report generation handled by analytics backend
  };

  const handleScheduleReport = (_reportId: number) => {
    // Report scheduling handled by analytics backend
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'executive': return 'bg-purple-50 text-purple-700';
      case 'channel': return 'bg-blue-50 text-blue-700';
      case 'roi': return 'bg-green-50 text-green-700';
      case 'funnel': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Intelligent Reporting</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Reports */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">AI-Generated Reports</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeAvailableReports.map((report) => {
              const Icon = report.icon;
              const safeInsights = Array.isArray(report.insights) ? report.insights : [];
              
              return (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{report.title}</h5>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Frequency: {report.frequency}</span>
                      <span>Last: {report.lastGenerated}</span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 mb-1 block">Key Insights:</span>
                      <div className="flex flex-wrap gap-1">
                        {safeInsights.map((insight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateReport(report.id)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleScheduleReport(report.id)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Metrics Tracking */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Custom Metric Tracking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {safeCustomMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.name}</div>
                <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Scheduled Reports</h4>
          <div className="space-y-3">
            {safeScheduledReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{report.name}</span>
                  <div className="text-sm text-gray-600">Next: {report.nextDate}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{report.recipients} recipients</Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Report
            </Button>
          </div>
        </div>

        {/* Report Templates */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Smart Report Templates</h4>
          <p className="text-sm text-blue-700 mb-3">
            Our AI creates report templates based on your most important metrics and recent performance patterns.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">Campaign Performance</Button>
            <Button size="sm" variant="outline">Lead Quality Analysis</Button>
            <Button size="sm" variant="outline">Revenue Attribution</Button>
            <Button size="sm" variant="outline">Channel Optimization</Button>
          </div>
        </div>

        {/* Export Options */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Export & Sharing</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              PDF Report
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Excel Data
            </Button>
            <Button size="sm" variant="outline">
              <Share className="h-4 w-4 mr-1" />
              Share Dashboard
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportingFeatures;
