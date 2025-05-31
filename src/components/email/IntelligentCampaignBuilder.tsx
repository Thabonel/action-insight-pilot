
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Mail, Sparkles, Target, Clock, Users } from 'lucide-react';

const IntelligentCampaignBuilder: React.FC = () => {
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    template: 'newsletter',
    sendTime: 'optimal'
  });

  const [predictions] = useState({
    openRate: 34.2,
    clickRate: 5.1,
    conversionRate: 2.8,
    optimalTime: '10:30 AM Tuesday',
    confidence: 92
  });

  const [subjectSuggestions] = useState([
    { text: "5 Ways to Boost Your ROI This Quarter", score: 94 },
    { text: "Your Weekly Marketing Insights", score: 87 },
    { text: "Breaking: New Strategy Drives 40% Growth", score: 91 }
  ]);

  const [templates] = useState([
    { 
      id: 'newsletter', 
      name: 'Newsletter', 
      performance: 'High',
      openRate: 35.2,
      description: 'Weekly insights and updates'
    },
    { 
      id: 'educational', 
      name: 'Educational', 
      performance: 'Very High',
      openRate: 42.1,
      description: 'How-to guides and tips'
    },
    { 
      id: 'promotional', 
      name: 'Promotional', 
      performance: 'Medium',
      openRate: 28.5,
      description: 'Product announcements and offers'
    }
  ]);

  const handleCreateCampaign = () => {
    behaviorTracker.trackAction('feature_use', 'email_campaign_create', {
      template: campaign.template,
      predictedOpenRate: predictions.openRate
    });
  };

  const handleSubjectSelect = (subject: string) => {
    setCampaign(prev => ({ ...prev, subject }));
    behaviorTracker.trackAction('feature_use', 'email_subject_select', { subject });
  };

  const handleTemplateSelect = (templateId: string) => {
    setCampaign(prev => ({ ...prev, template: templateId }));
    behaviorTracker.trackAction('feature_use', 'email_template_select', { templateId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>Intelligent Campaign Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Prediction */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">Performance Prediction</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{predictions.openRate}%</div>
              <div className="text-xs text-purple-700">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{predictions.clickRate}%</div>
              <div className="text-xs text-purple-700">Click Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{predictions.conversionRate}%</div>
              <div className="text-xs text-purple-700">Conversion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{predictions.confidence}%</div>
              <div className="text-xs text-purple-700">Confidence</div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
            <Input
              value={campaign.name}
              onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter campaign name..."
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    campaign.template === template.id 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{template.name}</span>
                    <Badge 
                      variant={template.performance === 'Very High' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {template.openRate}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
            <Input
              value={campaign.subject}
              onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject line..."
            />
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-2">AI Suggestions:</p>
              <div className="space-y-1">
                {subjectSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSubjectSelect(suggestion.text)}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  >
                    <span className="text-sm">{suggestion.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <Textarea
              value={campaign.content}
              onChange={(e) => setCampaign(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter email content..."
              rows={6}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button onClick={handleCreateCampaign} className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            A/B Test
          </Button>
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentCampaignBuilder;
