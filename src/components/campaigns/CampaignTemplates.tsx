
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Mail, Target, BarChart, Zap, Clock, Users } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  successRate: number;
  avgTime: string;
  icon: any;
  color: string;
  difficulty: 'Quick' | 'Detailed';
  bestFor: string[];
}

interface CampaignTemplatesProps {
  onTemplateSelect: (template: Template) => void;
}

const CampaignTemplates: React.FC<CampaignTemplatesProps> = ({ onTemplateSelect }) => {
  const templates: Template[] = [
    {
      id: 'email-nurture',
      name: 'Email Nurture Sequence',
      type: 'email',
      description: 'Automated email sequence for lead nurturing and conversion',
      successRate: 78,
      avgTime: '30 mins',
      icon: Mail,
      color: 'blue',
      difficulty: 'Quick',
      bestFor: ['Lead generation', 'Customer retention']
    },
    {
      id: 'product-launch',
      name: 'Product Launch Campaign',
      type: 'mixed',
      description: 'Multi-channel campaign for new product announcements',
      successRate: 85,
      avgTime: '2 hours',
      icon: Target,
      color: 'green',
      difficulty: 'Detailed',
      bestFor: ['Product launches', 'Brand awareness']
    },
    {
      id: 'social-engagement',
      name: 'Social Media Boost',
      type: 'social',
      description: 'Quick social media campaign to increase engagement',
      successRate: 65,
      avgTime: '15 mins',
      icon: Users,
      color: 'purple',
      difficulty: 'Quick',
      bestFor: ['Social engagement', 'Community building']
    },
    {
      id: 'content-series',
      name: 'Content Marketing Series',
      type: 'content',
      description: 'Educational content series to establish thought leadership',
      successRate: 82,
      avgTime: '3 hours',
      icon: BarChart,
      color: 'orange',
      difficulty: 'Detailed',
      bestFor: ['Thought leadership', 'SEO', 'Education']
    },
    {
      id: 'flash-promotion',
      name: 'Flash Promotion',
      type: 'mixed',
      description: 'Time-sensitive promotional campaign across all channels',
      successRate: 72,
      avgTime: '45 mins',
      icon: Zap,
      color: 'red',
      difficulty: 'Quick',
      bestFor: ['Sales boost', 'Inventory clearance']
    },
    {
      id: 'webinar-promotion',
      name: 'Webinar Promotion',
      type: 'mixed',
      description: 'Complete campaign to promote and fill webinar attendance',
      successRate: 89,
      avgTime: '1.5 hours',
      icon: Clock,
      color: 'indigo',
      difficulty: 'Detailed',
      bestFor: ['Lead generation', 'Education', 'Demos']
    }
  ];

  const handleTemplateSelect = (template: Template) => {
    behaviorTracker.trackAction('planning', 'campaign_templates', {
      templateId: template.id,
      templateType: template.type,
      difficulty: template.difficulty
    });
    onTemplateSelect(template);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const quickTemplates = templates.filter(t => t.difficulty === 'Quick');
  const detailedTemplates = templates.filter(t => t.difficulty === 'Detailed');

  return (
    <div className="space-y-6">
      {/* Quick Launch Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Quick Launch Templates</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Fast setup, proven results</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTemplates.map((template) => {
              const Icon = template.icon;
              const colorClasses = getColorClasses(template.color);
              
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{template.type} campaign</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-green-600 font-medium">{template.successRate}% success</span>
                      <span className="text-gray-500">{template.avgTime} setup</span>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      {template.difficulty}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {template.bestFor.map((use) => (
                        <span key={use} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Planning Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Detailed Planning Templates</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Comprehensive campaigns for maximum impact</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailedTemplates.map((template) => {
              const Icon = template.icon;
              const colorClasses = getColorClasses(template.color);
              
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{template.type} campaign</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-green-600 font-medium">{template.successRate}% success</span>
                      <span className="text-gray-500">{template.avgTime} setup</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {template.difficulty}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {template.bestFor.map((use) => (
                        <span key={use} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {use}
                        </span>
                      ))}
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

export default CampaignTemplates;
