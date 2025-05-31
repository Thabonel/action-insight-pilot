
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Users, Share2, Calendar, Star } from 'lucide-react';

const WorkflowTemplates: React.FC = () => {
  const templates = [
    {
      id: 1,
      name: 'Product Launch Campaign',
      description: 'Complete multi-channel launch sequence',
      icon: Rocket,
      color: 'blue',
      steps: 8,
      duration: '4 weeks',
      successRate: 89,
      channels: ['Email', 'Social', 'Content'],
      featured: true
    },
    {
      id: 2,
      name: 'Lead Nurture Sequence',
      description: 'Convert prospects into customers',
      icon: Users,
      color: 'green',
      steps: 6,
      duration: '2 weeks',
      successRate: 76,
      channels: ['Email', 'Social'],
      featured: false
    },
    {
      id: 3,
      name: 'Content Distribution',
      description: 'Maximize content reach across platforms',
      icon: Share2,
      color: 'purple',
      steps: 5,
      duration: '1 week',
      successRate: 82,
      channels: ['Social', 'Content'],
      featured: false
    },
    {
      id: 4,
      name: 'Event Promotion',
      description: 'Drive registrations and attendance',
      icon: Calendar,
      color: 'orange',
      steps: 7,
      duration: '3 weeks',
      successRate: 85,
      channels: ['Email', 'Social', 'Content'],
      featured: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(template.color)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{template.successRate}% success</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Steps:</span>
                    <span className="ml-1 font-medium">{template.steps}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-1 font-medium">{template.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {template.channels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline">
                    Use Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Custom Template Request</h4>
          <p className="text-sm text-gray-600 mb-3">
            Need a specific workflow? Our AI can create custom templates based on your requirements.
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Request Custom Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowTemplates;
